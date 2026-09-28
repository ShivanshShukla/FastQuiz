import datetime

import jwt
import pyotp
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select

from app.core.config import settings
from app.core.jwt import create_admin_access_token
from app.core.security import hash_password, verify_dummy_password, verify_password
from app.models.admin import Admin, AdminRefreshToken
from app.routers.admin_auth import utc_now
from tests.conftest import TestSessionLocal


@pytest_asyncio.fixture
async def seeded_super_admin():
    async with TestSessionLocal() as session:
        admin = Admin(
            email="superadmin@fastquiz.dev",
            password_hash=hash_password("SuperSecretPassword123!"),
            name="Primary Super Admin",
            role="super_admin",
            is_active=True,
            totp_enabled=False,
        )
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        return admin


# ============================================================================
# 1. Argon2id Password Hashing & Timing Attack Tests
# ============================================================================
def test_argon2id_hashing():
    pwd = "ValidComplexPassword123!"
    hashed = hash_password(pwd)
    assert hashed.startswith("$argon2id$")
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_dummy_password_timing_defense():
    # Should execute without throwing any exception
    verify_dummy_password("AnyPasswordAttempt123!")


# ============================================================================
# 2. Login Validation & Generic Timing-Safe Rejections
# ============================================================================
@pytest.mark.asyncio
async def test_password_length_validation(client: AsyncClient):
    # Less than 12 chars must fail at validation layer (HTTP 422)
    response = await client.post(
        "/admin/auth/login",
        json={"email": "admin@fastquiz.dev", "password": "Short123!"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_unknown_email_uniform_401(client: AsyncClient):
    response = await client.post(
        "/admin/auth/login",
        json={"email": "nonexistent@fastquiz.dev", "password": "ValidPassword123!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Invalid email or password."


@pytest.mark.asyncio
async def test_wrong_password_uniform_401(
    client: AsyncClient, seeded_super_admin: Admin
):
    response = await client.post(
        "/admin/auth/login",
        json={"email": seeded_super_admin.email, "password": "WrongPassword123!"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."


# ============================================================================
# 3. Rate Limiting & Account Lockout
# ============================================================================
@pytest.mark.asyncio
async def test_account_lockout_after_five_failures(
    client: AsyncClient, seeded_super_admin: Admin
):
    # 5 failed attempts
    for _ in range(5):
        res = await client.post(
            "/admin/auth/login",
            json={"email": seeded_super_admin.email, "password": "WrongPassword123!"},
        )
        assert res.status_code == 401

    # 6th attempt must be locked out with HTTP 429
    locked_res = await client.post(
        "/admin/auth/login",
        json={"email": seeded_super_admin.email, "password": "WrongPassword123!"},
    )
    assert locked_res.status_code == 429
    assert "temporarily locked" in locked_res.json()["detail"]


# ============================================================================
# 4. TOTP First-Time Enrollment Flow
# ============================================================================
@pytest.mark.asyncio
async def test_first_time_login_requires_totp_enrollment(
    client: AsyncClient, seeded_super_admin: Admin
):
    response = await client.post(
        "/admin/auth/login",
        json={
            "email": seeded_super_admin.email,
            "password": "SuperSecretPassword123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "totp_enrollment_required"
    assert "pre_auth_token" in data
    assert "<svg" in data["qr_code_svg"]
    assert len(data["recovery_codes"]) == 8

    # Confirm enrollment with TOTP code
    pre_auth = data["pre_auth_token"]
    raw_secret = data["secret"]
    valid_totp_code = pyotp.TOTP(raw_secret).now()

    confirm_res = await client.post(
        "/admin/auth/totp/confirm-enrollment",
        json={"pre_auth_token": pre_auth, "code": valid_totp_code},
    )
    assert confirm_res.status_code == 200
    auth_data = confirm_res.json()
    assert auth_data["status"] == "authenticated"
    assert "access_token" in auth_data
    assert auth_data["admin"]["totp_enabled"] is True

    # Verify httpOnly cookie is set
    assert "admin_refresh_token" in confirm_res.cookies


# ============================================================================
# 5. Subsequent Login with TOTP Challenge & Recovery Code Fallback
# ============================================================================
@pytest.mark.asyncio
async def test_subsequent_login_and_recovery_code(
    client: AsyncClient, seeded_super_admin: Admin
):
    # Step A: First login & enroll
    login_1 = await client.post(
        "/admin/auth/login",
        json={
            "email": seeded_super_admin.email,
            "password": "SuperSecretPassword123!",
        },
    )
    enroll_data = login_1.json()
    secret = enroll_data["secret"]
    recovery_code = enroll_data["recovery_codes"][0]

    await client.post(
        "/admin/auth/totp/confirm-enrollment",
        json={
            "pre_auth_token": enroll_data["pre_auth_token"],
            "code": pyotp.TOTP(secret).now(),
        },
    )

    # Step B: Second login - now triggers totp_required
    login_2 = await client.post(
        "/admin/auth/login",
        json={
            "email": seeded_super_admin.email,
            "password": "SuperSecretPassword123!",
        },
    )
    assert login_2.status_code == 200
    challenge_data = login_2.json()
    assert challenge_data["status"] == "totp_required"
    pre_auth_2 = challenge_data["pre_auth_token"]

    # Step C: Verify with recovery code instead of 6-digit TOTP
    recovery_res = await client.post(
        "/admin/auth/totp/verify",
        json={"pre_auth_token": pre_auth_2, "code": recovery_code},
    )
    assert recovery_res.status_code == 200
    assert recovery_res.json()["status"] == "authenticated"

    # Step D: Ensure used recovery code is burned and cannot be reused
    login_3 = await client.post(
        "/admin/auth/login",
        json={
            "email": seeded_super_admin.email,
            "password": "SuperSecretPassword123!",
        },
    )
    pre_auth_3 = login_3.json()["pre_auth_token"]
    reuse_res = await client.post(
        "/admin/auth/totp/verify",
        json={"pre_auth_token": pre_auth_3, "code": recovery_code},
    )
    assert reuse_res.status_code == 401


# ============================================================================
# 6. Session Refresh Rotation & Logout
# ============================================================================
@pytest.mark.asyncio
async def test_cookie_refresh_rotation_and_logout(
    client: AsyncClient, seeded_super_admin: Admin
):
    # Login & enroll
    login_res = await client.post(
        "/admin/auth/login",
        json={
            "email": seeded_super_admin.email,
            "password": "SuperSecretPassword123!",
        },
    )
    enroll_data = login_res.json()
    confirm_res = await client.post(
        "/admin/auth/totp/confirm-enrollment",
        json={
            "pre_auth_token": enroll_data["pre_auth_token"],
            "code": pyotp.TOTP(enroll_data["secret"]).now(),
        },
    )
    initial_cookie = confirm_res.cookies.get("admin_refresh_token")
    assert initial_cookie is not None

    # Refresh token call
    refresh_res = await client.post(
        "/admin/auth/refresh",
        cookies={"admin_refresh_token": initial_cookie},
    )
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data
    new_cookie = refresh_res.cookies.get("admin_refresh_token")
    assert new_cookie is not None
    assert new_cookie != initial_cookie  # Must be rotated!

    # Immediate reuse within grace period succeeds (parallel requests)
    concurrent_res = await client.post(
        "/admin/auth/refresh",
        cookies={"admin_refresh_token": initial_cookie},
    )
    assert concurrent_res.status_code == 200

    # Simulate expired grace period (> 30s) by shifting revoked_at back
    from app.core.security import hash_token

    initial_hash = hash_token(initial_cookie)
    async with TestSessionLocal() as session:
        result = await session.execute(
            select(AdminRefreshToken).where(
                AdminRefreshToken.token_hash == initial_hash
            )
        )
        old_record = result.scalars().first()
        if old_record:
            old_record.revoked_at = utc_now() - datetime.timedelta(seconds=45)
            await session.commit()

    # Reusing revoked cookie outside grace period must trigger 401
    reuse_res = await client.post(
        "/admin/auth/refresh",
        cookies={"admin_refresh_token": initial_cookie},
    )
    assert reuse_res.status_code == 401
    assert "Compromised session" in reuse_res.json()["detail"]

    # Logout with current cookie
    logout_res = await client.post(
        "/admin/auth/logout",
        cookies={"admin_refresh_token": new_cookie},
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True


# ============================================================================
# 7. JWT Audience & Learner Isolation
# ============================================================================
@pytest.mark.asyncio
async def test_jwt_audience_isolation(client: AsyncClient, seeded_super_admin: Admin):
    # Valid admin token with aud: "fastquiz-admin"
    valid_token, _ = create_admin_access_token(
        seeded_super_admin.id,
        seeded_super_admin.email,
        seeded_super_admin.role,
        seeded_super_admin.name,
    )

    me_res = await client.get(
        "/admin/auth/me",
        headers={"Authorization": f"Bearer {valid_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == seeded_super_admin.email

    # Learner token with aud: "fastquiz-web" or generic audience must be rejected
    learner_token = jwt.encode(
        {
            "sub": "learner-123",
            "email": "learner@fastquiz.dev",
            "aud": "fastquiz-learner",  # Learner audience!
            "iss": "fastquiz-auth-service",
        },
        settings.ADMIN_JWT_SECRET,
        algorithm="HS256",
    )
    rejected_res = await client.get(
        "/admin/auth/me",
        headers={"Authorization": f"Bearer {learner_token}"},
    )
    assert rejected_res.status_code == 401


# ============================================================================
# 8. Super Admin Invite
# ============================================================================
@pytest.mark.asyncio
async def test_super_admin_invite_member(
    client: AsyncClient, seeded_super_admin: Admin
):
    super_admin_token, _ = create_admin_access_token(
        seeded_super_admin.id,
        seeded_super_admin.email,
        "super_admin",
        "Primary Super Admin",
    )

    invite_res = await client.post(
        "/admin/auth/invite",
        headers={"Authorization": f"Bearer {super_admin_token}"},
        json={
            "email": "invited.reviewer@fastquiz.dev",
            "name": "Jane Reviewer",
            "role": "admin",
        },
    )
    assert invite_res.status_code == 200
    data = invite_res.json()
    assert data["email"] == "invited.reviewer@fastquiz.dev"
    assert "Temporary password" in data["message"]

    # Non-super_admin cannot invite
    async with TestSessionLocal() as session:
        reg_admin = Admin(
            id="admin-2",
            email="regular.admin@fastquiz.dev",
            password_hash=hash_password("RegularPassword123!"),
            name="Regular Admin",
            role="admin",
            is_active=True,
        )
        session.add(reg_admin)
        await session.commit()

    regular_admin_token, _ = create_admin_access_token(
        "admin-2", "regular.admin@fastquiz.dev", "admin", "Regular Admin"
    )
    forbidden_res = await client.post(
        "/admin/auth/invite",
        headers={"Authorization": f"Bearer {regular_admin_token}"},
        json={
            "email": "other@fastquiz.dev",
            "name": "Other Reviewer",
            "role": "admin",
        },
    )
    assert forbidden_res.status_code == 403


# ============================================================================
# 9. Super Admin Bootstrap Seed Idempotency
# ============================================================================
@pytest.mark.asyncio
async def test_bootstrap_super_admin_idempotent():
    from app.cli.bootstrap import bootstrap_super_admin

    async with TestSessionLocal() as session:
        # First execution creates the super admin
        admin1 = await bootstrap_super_admin(session)
        assert admin1.email == settings.BOOTSTRAP_ADMIN_EMAIL.lower()
        assert admin1.role == "super_admin"

        # Second execution returns the existing super admin without duplicating
        admin2 = await bootstrap_super_admin(session)
        assert admin2.id == admin1.id
        assert admin2.email == admin1.email
