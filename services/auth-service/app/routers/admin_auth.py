import datetime
import json
import logging
import secrets
from typing import Annotated, Any

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import get_db
from app.core.jwt import (
    create_admin_access_token,
    create_admin_preauth_token,
    decode_admin_preauth_token,
    decode_admin_token,
)
from app.core.rate_limit import AdminRateLimiter
from app.core.security import (
    hash_password,
    hash_token,
    verify_dummy_password,
    verify_password,
)
from app.core.totp import (
    decrypt_totp_secret,
    encrypt_totp_secret,
    generate_qr_code_svg,
    generate_recovery_codes,
    generate_totp_provisioning_uri,
    generate_totp_secret,
    verify_recovery_code,
    verify_totp_code,
)
from app.models.admin import Admin, AdminAuditLog, AdminRefreshToken
from app.schemas.admin import (
    AdminAuthSuccessResponse,
    AdminInviteRequest,
    AdminInviteResponse,
    AdminLoginRequest,
    AdminProfileResponse,
    AdminTotpConfirmEnrollmentRequest,
    AdminTotpEnrollmentRequiredResponse,
    AdminTotpRequiredResponse,
    AdminTotpVerifyRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)
rate_limiter = AdminRateLimiter()

REFRESH_COOKIE_NAME = "admin_refresh_token"
REFRESH_COOKIE_PATH = "/admin/auth"


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


def ensure_utc(dt: datetime.datetime) -> datetime.datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=datetime.UTC)
    return dt


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


async def write_audit_log(
    db: AsyncSession,
    request: Request,
    email: str,
    event_type: str,
    status_str: str,
    admin_id: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    ip = get_client_ip(request)
    ua = request.headers.get("user-agent", "")[:255]
    log_entry = AdminAuditLog(
        admin_id=admin_id,
        attempted_email=email,
        event_type=event_type,
        status=status_str,
        ip_address=ip,
        user_agent=ua,
        details=json.dumps(details) if details else None,
    )
    db.add(log_entry)
    await db.commit()


async def set_refresh_cookie_and_create_session(
    response: Response,
    db: AsyncSession,
    admin_id: str,
    request: Request,
) -> str:
    """Generates a high-entropy random refresh token, stores its SHA-256 hash in DB,
    and sets an httpOnly, SameSite=Strict cookie."""
    raw_token = secrets.token_urlsafe(64)
    token_hashed = hash_token(raw_token)

    expires_delta = datetime.timedelta(days=settings.ADMIN_REFRESH_TOKEN_EXPIRE_DAYS)
    expires_at = utc_now() + expires_delta

    session_record = AdminRefreshToken(
        admin_id=admin_id,
        token_hash=token_hashed,
        expires_at=expires_at,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:255],
    )
    db.add(session_record)
    await db.commit()

    is_production = settings.ENVIRONMENT.lower() == "production"
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
        max_age=int(expires_delta.total_seconds()),
    )
    return raw_token


async def get_current_admin(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Admin:
    """Dependency validating admin access token with audience 'fastquiz-admin'."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = decode_admin_token(token)
    except Exception as e:
        logger.warning("Admin token verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or non-admin access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    admin_id = payload.get("sub")
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    admin = result.scalars().first()

    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is inactive or no longer exists",
        )

    return admin


# ============================================================================
# 1. Login Endpoint
# ============================================================================
@router.post(
    "/login",
    response_model=AdminAuthSuccessResponse
    | AdminTotpRequiredResponse
    | AdminTotpEnrollmentRequiredResponse,
)
async def admin_login(
    payload: AdminLoginRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> (
    AdminAuthSuccessResponse
    | AdminTotpRequiredResponse
    | AdminTotpEnrollmentRequiredResponse
):
    ip = get_client_ip(request)
    email = payload.email.strip().lower()

    # 1. Check Rate Limit / Lockout in Redis
    is_locked, ttl = await rate_limiter.is_locked_out(ip, email)
    if is_locked:
        await write_audit_log(
            db,
            request,
            email,
            "lockout_blocked",
            "failure",
            details={"retry_after": ttl},
        )
        mins = max(1, ttl // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Too many failed attempts. "
                f"Account temporarily locked for {mins} minutes."
            ),
        )

    # 2. Database lookup
    result = await db.execute(select(Admin).where(Admin.email == email))
    admin = result.scalars().first()

    # 3. Timing-Safe Password Verification
    if not admin or not admin.is_active:
        verify_dummy_password(payload.password)
        await rate_limiter.record_failure(ip, email)
        await write_audit_log(
            db,
            request,
            email,
            "login_failed",
            "failure",
            details={"reason": "not_found"},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(payload.password, admin.password_hash):
        await rate_limiter.record_failure(ip, email)
        await write_audit_log(
            db,
            request,
            email,
            "login_failed",
            "failure",
            admin_id=admin.id,
            details={"reason": "bad_password"},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # 4. Successful Password Verification: Reset failures
    await rate_limiter.reset_failures(ip, email)
    await write_audit_log(
        db, request, email, "password_verified", "success", admin_id=admin.id
    )

    # 5. Check 2FA (TOTP) Requirement
    if admin.totp_enabled:
        # Pre-auth token required to submit 6-digit TOTP
        preauth_token, expires_in = create_admin_preauth_token(admin.id, admin.email)
        return AdminTotpRequiredResponse(
            status="totp_required",
            pre_auth_token=preauth_token,
            expires_in=expires_in,
        )

    # First time login / Enrollment required
    secret = generate_totp_secret()
    encrypted_secret = encrypt_totp_secret(secret)
    plain_codes, hashed_codes = generate_recovery_codes(count=8)

    admin.totp_secret_encrypted = encrypted_secret
    admin.totp_recovery_codes_hashed = json.dumps(hashed_codes)
    await db.commit()

    uri = generate_totp_provisioning_uri(admin.email, secret)
    qr_svg = generate_qr_code_svg(uri)
    preauth_token, expires_in = create_admin_preauth_token(admin.id, admin.email)

    return AdminTotpEnrollmentRequiredResponse(
        status="totp_enrollment_required",
        pre_auth_token=preauth_token,
        qr_code_svg=qr_svg,
        secret=secret,
        recovery_codes=plain_codes,
        expires_in=expires_in,
    )


# ============================================================================
# 2. TOTP Confirmation (First-Time Enrollment)
# ============================================================================
@router.post("/totp/confirm-enrollment", response_model=AdminAuthSuccessResponse)
async def confirm_totp_enrollment(
    payload: AdminTotpConfirmEnrollmentRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AdminAuthSuccessResponse:
    try:
        claims = decode_admin_preauth_token(payload.pre_auth_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired pre-auth token. Please log in again.",
        ) from e

    admin_id = claims.get("sub")
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    admin = result.scalars().first()

    if not admin or not admin.totp_secret_encrypted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP enrollment data not found",
        )

    secret = decrypt_totp_secret(admin.totp_secret_encrypted)
    if not verify_totp_code(secret, payload.code):
        await write_audit_log(
            db,
            request,
            admin.email,
            "totp_enrollment_failed",
            "failure",
            admin_id=admin.id,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid 6-digit TOTP code. Please check your authenticator app.",
        )

    admin.totp_enabled = True
    admin.last_login_at = utc_now()
    await db.commit()

    await write_audit_log(
        db,
        request,
        admin.email,
        "totp_enrolled_and_logged_in",
        "success",
        admin_id=admin.id,
    )

    await set_refresh_cookie_and_create_session(response, db, admin.id, request)
    access_token, expires_in = create_admin_access_token(
        admin.id, admin.email, admin.role, admin.name
    )

    return AdminAuthSuccessResponse(
        status="authenticated",
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in,
        admin=AdminProfileResponse(
            id=admin.id,
            email=admin.email,
            name=admin.name,
            role=admin.role,
            totp_enabled=admin.totp_enabled,
            created_at=admin.created_at.isoformat(),
        ),
    )


# ============================================================================
# 3. TOTP Verification (Subsequent Logins)
# ============================================================================
@router.post("/totp/verify", response_model=AdminAuthSuccessResponse)
async def verify_totp(
    payload: AdminTotpVerifyRequest,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AdminAuthSuccessResponse:
    try:
        claims = decode_admin_preauth_token(payload.pre_auth_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired pre-auth token. Please log in again.",
        ) from e

    admin_id = claims.get("sub")
    result = await db.execute(select(Admin).where(Admin.id == admin_id))
    admin = result.scalars().first()

    if not admin or not admin.totp_enabled or not admin.totp_secret_encrypted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TOTP is not configured for this account",
        )

    raw_code = payload.code.strip()
    is_valid = False
    used_recovery = False

    # Check standard 6-digit TOTP
    secret = decrypt_totp_secret(admin.totp_secret_encrypted)
    if len(raw_code) == 6 and raw_code.isdigit():
        is_valid = verify_totp_code(secret, raw_code)

    # Fallback to recovery code check
    if not is_valid and admin.totp_recovery_codes_hashed:
        stored_hashes = json.loads(admin.totp_recovery_codes_hashed)
        matched, updated_hashes = verify_recovery_code(raw_code, stored_hashes)
        if matched:
            is_valid = True
            used_recovery = True
            admin.totp_recovery_codes_hashed = json.dumps(updated_hashes)

    if not is_valid:
        await write_audit_log(
            db, request, admin.email, "totp_failed", "failure", admin_id=admin.id
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid verification code or recovery code.",
        )

    admin.last_login_at = utc_now()
    await db.commit()

    await write_audit_log(
        db,
        request,
        admin.email,
        "totp_login_success",
        "success",
        admin_id=admin.id,
        details={"used_recovery_code": used_recovery},
    )

    await set_refresh_cookie_and_create_session(response, db, admin.id, request)
    access_token, expires_in = create_admin_access_token(
        admin.id, admin.email, admin.role, admin.name
    )

    return AdminAuthSuccessResponse(
        status="authenticated",
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in,
        admin=AdminProfileResponse(
            id=admin.id,
            email=admin.email,
            name=admin.name,
            role=admin.role,
            totp_enabled=admin.totp_enabled,
            created_at=admin.created_at.isoformat(),
        ),
    )


# ============================================================================
# 4. Token Refresh & Rotation (Cookie-based)
# ============================================================================
@router.post("/refresh", response_model=AdminAuthSuccessResponse)
async def refresh_admin_token(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin_refresh_token: Annotated[str | None, Cookie()] = None,
) -> AdminAuthSuccessResponse:
    if not admin_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token cookie",
        )

    token_hashed = hash_token(admin_refresh_token)
    result = await db.execute(
        select(AdminRefreshToken).where(AdminRefreshToken.token_hash == token_hashed)
    )
    session_record = result.scalars().first()

    if not session_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )

    # Token Reuse Detection: Allow 30-second grace window for concurrent requests
    rotation_grace_period_seconds = 30.0
    if session_record.revoked_at is not None:
        delta = utc_now() - ensure_utc(session_record.revoked_at)
        revocation_age = delta.total_seconds()
        if revocation_age < rotation_grace_period_seconds:
            logger.info(
                "Refresh token presented within grace window (age=%.2fs) "
                "for admin_id=%s. Returning active session.",
                revocation_age,
                session_record.admin_id,
            )
            # Find the active replacement session for this admin
            active_result = await db.execute(
                select(AdminRefreshToken)
                .where(
                    AdminRefreshToken.admin_id == session_record.admin_id,
                    AdminRefreshToken.revoked_at.is_(None),
                )
                .order_by(AdminRefreshToken.created_at.desc())
            )
            active_session = active_result.scalars().first()
            if active_session and ensure_utc(active_session.expires_at) > utc_now():
                admin_result = await db.execute(
                    select(Admin).where(Admin.id == session_record.admin_id)
                )
                admin = admin_result.scalars().first()
                if admin and admin.is_active:
                    access_token, expires_in = create_admin_access_token(
                        admin.id, admin.email, admin.role, admin.name
                    )
                    return AdminAuthSuccessResponse(
                        status="authenticated",
                        access_token=access_token,
                        token_type="bearer",
                        expires_in=expires_in,
                        admin=AdminProfileResponse(
                            id=admin.id,
                            email=admin.email,
                            name=admin.name,
                            role=admin.role,
                            totp_enabled=admin.totp_enabled,
                            created_at=admin.created_at.isoformat(),
                        ),
                    )

        logger.warning(
            "Reuse of revoked refresh token detected for admin_id=%s (age=%.2fs)! "
            "Revoking all sessions.",
            session_record.admin_id,
            revocation_age,
        )
        await db.execute(
            update(AdminRefreshToken)
            .where(AdminRefreshToken.admin_id == session_record.admin_id)
            .values(revoked_at=utc_now())
        )
        await db.commit()
        response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Compromised session detected. All sessions revoked. "
                "Please log in again."
            ),
        )

    # Check expiration
    if ensure_utc(session_record.expires_at) < utc_now():
        session_record.revoked_at = utc_now()
        await db.commit()
        response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please log in again.",
        )

    # Get Admin
    admin_result = await db.execute(
        select(Admin).where(Admin.id == session_record.admin_id)
    )
    admin = admin_result.scalars().first()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin is inactive or deleted",
        )

    # Atomic Rotation: Revoke current token, issue new token in cookie
    session_record.revoked_at = utc_now()
    await db.commit()

    await set_refresh_cookie_and_create_session(response, db, admin.id, request)
    access_token, expires_in = create_admin_access_token(
        admin.id, admin.email, admin.role, admin.name
    )

    await write_audit_log(
        db, request, admin.email, "token_refreshed", "success", admin_id=admin.id
    )

    return AdminAuthSuccessResponse(
        status="authenticated",
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in,
        admin=AdminProfileResponse(
            id=admin.id,
            email=admin.email,
            name=admin.name,
            role=admin.role,
            totp_enabled=admin.totp_enabled,
            created_at=admin.created_at.isoformat(),
        ),
    )


# ============================================================================
# 5. Logout Endpoint
# ============================================================================
@router.post("/logout")
async def admin_logout(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin_refresh_token: Annotated[str | None, Cookie()] = None,
) -> dict[str, bool]:
    if admin_refresh_token:
        token_hashed = hash_token(admin_refresh_token)
        result = await db.execute(
            select(AdminRefreshToken).where(
                AdminRefreshToken.token_hash == token_hashed
            )
        )
        session_record = result.scalars().first()
        if session_record and session_record.revoked_at is None:
            session_record.revoked_at = utc_now()
            await db.commit()
            await write_audit_log(
                db,
                request,
                session_record.admin_id,
                "logout",
                "success",
                admin_id=session_record.admin_id,
            )

    response.delete_cookie(key=REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)
    return {"success": True}


# ============================================================================
# 6. Current Admin Profile (Requires aud: fastquiz-admin)
# ============================================================================
@router.get("/me", response_model=AdminProfileResponse)
async def get_admin_profile(
    current_admin: Annotated[Admin, Depends(get_current_admin)],
) -> AdminProfileResponse:
    return AdminProfileResponse(
        id=current_admin.id,
        email=current_admin.email,
        name=current_admin.name,
        role=current_admin.role,
        totp_enabled=current_admin.totp_enabled,
        created_at=current_admin.created_at.isoformat(),
    )


# ============================================================================
# 7. Super Admin Invite Endpoint (Requires role: super_admin)
# ============================================================================
@router.post("/invite", response_model=AdminInviteResponse)
async def invite_admin(
    payload: AdminInviteRequest,
    current_admin: Annotated[Admin, Depends(get_current_admin)],
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AdminInviteResponse:
    if current_admin.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Administrators can invite new admin team members.",
        )

    email = payload.email.strip().lower()
    existing = await db.execute(select(Admin).where(Admin.email == email))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An administrator with this email already exists.",
        )

    # Initial random temporary password (at least 16 chars)
    temp_password = f"TempPass-{secrets.token_urlsafe(12)}!"
    pwd_hash = hash_password(temp_password)

    new_admin = Admin(
        email=email,
        name=payload.name.strip(),
        role=payload.role,
        password_hash=pwd_hash,
        is_active=True,
        totp_enabled=False,
    )
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)

    await write_audit_log(
        db,
        request,
        current_admin.email,
        "admin_invited",
        "success",
        admin_id=current_admin.id,
        details={"invited_admin_id": new_admin.id, "invited_email": email},
    )

    return AdminInviteResponse(
        id=new_admin.id,
        email=new_admin.email,
        name=new_admin.name,
        role=new_admin.role,
        message=f"Admin invited successfully. Temporary password: {temp_password}",
    )
