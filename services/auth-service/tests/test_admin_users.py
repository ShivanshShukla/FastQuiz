import datetime
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
import fakeredis.aioredis

from app.core.db import Base, get_db
from app.core.jwt import create_admin_access_token
from app.core.security import hash_password
from app.main import app
from app.models.admin import Admin
from app.models.user import User, AdminNote
import app.core.rate_limit as rate_limit_module

from tests.conftest import TestSessionLocal


@pytest_asyncio.fixture
async def super_admin_token():
    async with TestSessionLocal() as session:
        admin = Admin(
            id="adm-super-02",
            email="superadmin2@fastquiz.dev",
            password_hash=hash_password("SuperSecretPass123!"),
            name="Alex Super Admin",
            role="super_admin",
            is_active=True,
            totp_enabled=True,
        )
        session.add(admin)
        await session.commit()

    token, _ = create_admin_access_token(
        admin_id="adm-super-02",
        email="superadmin2@fastquiz.dev",
        role="super_admin",
        name="Alex Super Admin",
    )
    return token


@pytest_asyncio.fixture
async def reviewer_token():
    async with TestSessionLocal() as session:
        admin = Admin(
            id="adm-rev-01",
            email="reviewer@fastquiz.dev",
            password_hash=hash_password("ReviewerPass123!"),
            name="Robin Reviewer",
            role="reviewer",
            is_active=True,
            totp_enabled=True,
        )
        session.add(admin)
        await session.commit()

    token, _ = create_admin_access_token(
        admin_id="adm-rev-01",
        email="reviewer@fastquiz.dev",
        role="reviewer",
        name="Robin Reviewer",
    )
    return token


@pytest_asyncio.fixture
async def support_token():
    async with TestSessionLocal() as session:
        admin = Admin(
            id="adm-sup-01",
            email="support@fastquiz.dev",
            password_hash=hash_password("SupportPass123!"),
            name="Sam Support",
            role="support",
            is_active=True,
            totp_enabled=True,
        )
        session.add(admin)
        await session.commit()

    token, _ = create_admin_access_token(
        admin_id="adm-sup-01",
        email="support@fastquiz.dev",
        role="support",
        name="Sam Support",
    )
    return token




@pytest.mark.asyncio
async def test_reviewer_role_forbidden_from_users(client, reviewer_token):
    headers = {"Authorization": f"Bearer {reviewer_token}"}
    response = await client.get("/admin/users", headers=headers)
    assert response.status_code == 403
    assert "Content Reviewer role is restricted" in response.json()["detail"]


@pytest.mark.asyncio
async def test_super_admin_lists_users(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    response = await client.get("/admin/users", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["summary"]["total_registered"] >= 1
    assert data["items"][0]["name"] == "Sarah Connor"


@pytest.mark.asyncio
async def test_search_and_filter_users(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    # Match query
    res_match = await client.get("/admin/users?q=Sarah", headers=headers)
    assert res_match.status_code == 200
    assert len(res_match.json()["items"]) == 1

    # Non-match query
    res_no_match = await client.get("/admin/users?q=NonExistentUser", headers=headers)
    assert res_no_match.status_code == 200
    assert len(res_no_match.json()["items"]) == 0


@pytest.mark.asyncio
async def test_user_detail_and_suspension_flow(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}

    # 1. Fetch detail
    res_detail = await client.get(f"/admin/users/{sample_user}", headers=headers)
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["name"] == "Sarah Connor"
    assert detail["status"] == "active"
    assert isinstance(detail["attempts"], list)

    # 2. Suspend user
    res_suspend = await client.post(
        f"/admin/users/{sample_user}/suspend",
        headers=headers,
        json={"reason": "Suspicious rapid attempt pattern"},
    )
    assert res_suspend.status_code == 200
    assert res_suspend.json()["success"] is True

    # Check status changed
    res_after = await client.get(f"/admin/users/{sample_user}", headers=headers)
    assert res_after.json()["status"] == "suspended"
    assert len(res_after.json()["notes"]) >= 1

    # 3. Unsuspend user
    res_unsuspend = await client.post(
        f"/admin/users/{sample_user}/unsuspend",
        headers=headers,
        json={"reason": "Identity verified via support ticket"},
    )
    assert res_unsuspend.status_code == 200
    assert res_unsuspend.json()["success"] is True

    res_restored = await client.get(f"/admin/users/{sample_user}", headers=headers)
    assert res_restored.json()["status"] == "active"


@pytest.mark.asyncio
async def test_user_grants_and_notes(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}

    # Grant quiz
    res_grant = await client.post(
        f"/admin/users/{sample_user}/grants",
        headers=headers,
        json={"quiz_id": "quiz-sliding-window", "reason": "Promotional bonus"},
    )
    assert res_grant.status_code == 200

    # Reset free grant
    res_reset = await client.post(
        f"/admin/users/{sample_user}/free-grants/reset",
        headers=headers,
        json={"reason": "Accidental quiz start on mobile glitch"},
    )
    assert res_reset.status_code == 200

    # Add note
    res_note = await client.post(
        f"/admin/users/{sample_user}/notes",
        headers=headers,
        json={"text": "User inquired about enterprise subscription discount."},
    )
    assert res_note.status_code == 200
    assert res_note.json()["text"] == "User inquired about enterprise subscription discount."

    # List notes
    res_notes = await client.get(f"/admin/users/{sample_user}/notes", headers=headers)
    assert res_notes.status_code == 200
    assert len(res_notes.json()) >= 3


@pytest.mark.asyncio
async def test_reveal_email_and_breakdown(client, support_token, sample_user):
    headers = {"Authorization": f"Bearer {support_token}"}

    res_reveal = await client.post(
        f"/admin/users/{sample_user}/reveal-email", headers=headers
    )
    assert res_reveal.status_code == 200
    assert res_reveal.json()["email"] == "sarah.connor@sky.net"

    res_breakdown = await client.get(
        f"/admin/users/{sample_user}/attempts/att-usr-1-1/breakdown", headers=headers
    )
    assert res_breakdown.status_code == 200
    assert len(res_breakdown.json()) >= 1


@pytest.mark.asyncio
async def test_csv_export_permissions(client, super_admin_token, support_token, sample_user):
    # Support cannot export CSV (403)
    sup_headers = {"Authorization": f"Bearer {support_token}"}
    res_sup = await client.get("/admin/users/export", headers=sup_headers)
    assert res_sup.status_code == 403

    # Super admin can export CSV (200)
    super_headers = {"Authorization": f"Bearer {super_admin_token}"}
    res_super = await client.get("/admin/users/export", headers=super_headers)
    assert res_super.status_code == 200
    assert res_super.headers["content-type"].startswith("text/csv")
    content = res_super.text
    assert "Sarah Connor" in content
    assert "sarah.connor@sky.net" in content
