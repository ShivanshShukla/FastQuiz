import datetime
import hashlib
import logging
import secrets
import urllib.parse
import uuid
from typing import Annotated

import httpx
import jwt
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.db import get_db
from app.core.jwt import (
    create_user_access_token,
    decode_user_token,
)
from app.core.oauth import (
    consume_oauth_state,
    fetch_github_user_and_primary_email,
    generate_pkce_pair,
    sanitize_next_url,
    store_oauth_state,
)
from app.core.security import hash_password, verify_dummy_password, verify_password
from app.models.user import Consent, Identity, User, UserRefreshToken
from app.schemas.auth import (
    ConsentRequest,
    ConsentResponse,
    MessageResponse,
    MobileOAuthExchangeRequest,
    TokenResponse,
    UserIdentityResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.account_linker import (
    AccountDeletedError,
    AccountLinkingRequiredError,
    AccountSuspendedError,
    UnlinkNotAllowedError,
    get_user_identities_and_methods,
    resolve_or_create_social_user,
    unlink_identity_from_user,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Learner Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)

COOKIE_ACCESS_NAME = "fastquiz_access_token"
COOKIE_REFRESH_NAME = "fastquiz_refresh_token"
REFRESH_COOKIE_PATH = "/auth"


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


def is_production() -> bool:
    return settings.ENVIRONMENT.lower() == "production"


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Sets secure httpOnly session cookies for Web clients."""
    secure_flag = is_production()
    # Access token cookie (valid across entire application)
    response.set_cookie(
        key=COOKIE_ACCESS_NAME,
        value=access_token,
        httponly=True,
        secure=secure_flag,
        samesite="lax",
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    # Refresh token cookie (restricted to /auth paths)
    response.set_cookie(
        key=COOKIE_REFRESH_NAME,
        value=refresh_token,
        httponly=True,
        secure=secure_flag,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


def clear_auth_cookies(response: Response) -> None:
    """Clears access and refresh token cookies."""
    response.delete_cookie(key=COOKIE_ACCESS_NAME, path="/")
    response.delete_cookie(key=COOKIE_REFRESH_NAME, path=REFRESH_COOKIE_PATH)


async def create_and_store_refresh_token(
    db: AsyncSession,
    user_id: str,
    family_id: str | None = None,
) -> tuple[str, str]:
    """Generates high-entropy refresh token, stores SHA-256 hash in DB with family_id."""
    raw_token = secrets.token_urlsafe(64)
    hashed = hashlib.sha256(raw_token.encode()).hexdigest()
    family = family_id or str(uuid.uuid4())
    expires_at = utc_now() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    record = UserRefreshToken(
        user_id=user_id,
        token_hash=hashed,
        family_id=family,
        is_revoked=False,
        expires_at=expires_at,
    )
    db.add(record)
    await db.commit()
    return raw_token, family


async def build_user_response(db: AsyncSession, user: User) -> UserResponse:
    identities, has_password = await get_user_identities_and_methods(db, user.id)
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        email_verified=user.email_verified,
        avatar_url=user.avatar_url,
        status=user.status,
        source=user.source,
        created_at=user.created_at,
        identities=[
            UserIdentityResponse(
                provider=i.provider,
                provider_user_id=i.provider_user_id,
                email_at_link=i.email_at_link,
                created_at=i.created_at,
            )
            for i in identities
        ],
        has_password=has_password,
    )


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Authenticates learner from Bearer Authorization header or httpOnly cookie."""
    token: str | None = None
    if credentials:
        token = credentials.credentials
    else:
        token = request.cookies.get(COOKIE_ACCESS_NAME)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        payload = decode_user_token(token)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        ) from err

    user_id = payload.get("sub")
    stmt = select(User).options(selectinload(User.identities)).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
        )

    if user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended",
        )
    if user.status == "deleted":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deleted",
        )

    return user


# =========================================================================
# Social Login: Initiate Flow
# =========================================================================


@router.get("/{provider}/login")
async def social_login(
    provider: str,
    request: Request,
    next: str = Query("/curriculum", description="Relative redirect URL after login"),
) -> RedirectResponse:
    provider = provider.lower().strip()
    if provider not in ("google", "github"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}",
        )

    clean_next = sanitize_next_url(next)
    state = secrets.token_urlsafe(32)
    code_verifier, code_challenge = generate_pkce_pair()
    nonce = secrets.token_urlsafe(32) if provider == "google" else None

    # Determine callback URL
    base_url = settings.OAUTH_REDIRECT_BASE_URL.rstrip("/")
    redirect_uri = f"{base_url}/auth/{provider}/callback"

    # Store state in Redis (10 minutes)
    await store_oauth_state(
        state=state,
        payload={
            "provider": provider,
            "nonce": nonce,
            "code_verifier": code_verifier,
            "next": clean_next,
            "redirect_uri": redirect_uri,
        },
        ttl_seconds=600,
    )

    if provider == "google":
        params = {
            "response_type": "code",
            "client_id": settings.GOOGLE_CLIENT_ID or "mock-google-client-id",
            "redirect_uri": redirect_uri,
            "scope": "openid email profile",
            "state": state,
            "nonce": nonce,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256",
            "access_type": "online",
            "prompt": "select_account",
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    else:  # github
        params = {
            "client_id": settings.GITHUB_CLIENT_ID or "mock-github-client-id",
            "redirect_uri": redirect_uri,
            "scope": "read:user user:email",
            "state": state,
        }
        auth_url = (
            f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"
        )

    return RedirectResponse(url=auth_url, status_code=status.HTTP_302_FOUND)


# =========================================================================
# Social Login: Provider Callback
# =========================================================================


@router.get("/{provider}/callback")
async def social_callback(
    provider: str,
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> RedirectResponse:
    provider = provider.lower().strip()
    if provider not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Invalid provider")

    # If provider returned an error (e.g. user cancelled)
    if error:
        logger.info("OAuth provider error returned: %s", error)
        return RedirectResponse(
            url=f"/login?error={urllib.parse.quote(error)}",
            status_code=status.HTTP_302_FOUND,
        )

    if not code or not state:
        return RedirectResponse(
            url="/login?error=missing_code_or_state",
            status_code=status.HTTP_302_FOUND,
        )

    # Validate state and consume immediately (single-use protection)
    state_data = await consume_oauth_state(state)
    if not state_data or state_data.get("provider") != provider:
        logger.warning("Invalid or expired OAuth state for %s", provider)
        return RedirectResponse(
            url="/login?error=invalid_state",
            status_code=status.HTTP_302_FOUND,
        )

    code_verifier = state_data.get("code_verifier")
    nonce = state_data.get("nonce")
    next_url = sanitize_next_url(state_data.get("next"))
    redirect_uri = state_data.get("redirect_uri")

    try:
        # Code exchange
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            if provider == "google":
                token_resp = await http_client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "code": code,
                        "code_verifier": code_verifier,
                        "grant_type": "authorization_code",
                        "redirect_uri": redirect_uri,
                    },
                )
                if token_resp.status_code != 200:
                    logger.error("Google token exchange failed: %s", token_resp.text)
                    return RedirectResponse(url="/login?error=token_exchange_failed")
                token_data = token_resp.json()

                # Parse and verify ID token claims
                id_token = token_data.get("id_token")
                claims = jwt.decode(id_token, options={"verify_signature": False})
                if nonce and claims.get("nonce") != nonce:
                    logger.error("Google nonce mismatch during OAuth callback")
                    return RedirectResponse(url="/login?error=nonce_mismatch")

                provider_user_id = str(claims.get("sub"))
                provider_email = claims.get("email")
                email_verified = bool(claims.get("email_verified", False))
                name = claims.get("name") or (
                    provider_email.split("@")[0] if provider_email else "User"
                )
                avatar_url = claims.get("picture")

            else:  # github
                token_resp = await http_client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "code": code,
                        "redirect_uri": redirect_uri,
                    },
                )
                if token_resp.status_code != 200:
                    logger.error("GitHub token exchange failed: %s", token_resp.text)
                    return RedirectResponse(url="/login?error=token_exchange_failed")
                token_data = token_resp.json()
                access_token = token_data.get("access_token")
                if not access_token:
                    return RedirectResponse(url="/login?error=no_access_token")

                # Fetch user profile and primary verified email
                (
                    gh_user,
                    verified_email,
                    is_verified,
                ) = await fetch_github_user_and_primary_email(
                    access_token=access_token,
                    http_client=http_client,
                )
                provider_user_id = str(gh_user["id"])
                provider_email = verified_email
                email_verified = is_verified
                name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
                avatar_url = gh_user.get("avatar_url")

        # Resolve or create user via strict Account Linking Rules
        user, is_linked, user_status = await resolve_or_create_social_user(
            db=db,
            provider=provider,
            provider_user_id=provider_user_id,
            provider_email=provider_email,
            email_verified=email_verified,
            name=name,
            avatar_url=avatar_url,
        )

        # Issue tokens and cookies
        access_token_jwt, _ = create_user_access_token(
            user_id=user.id,
            email=user.email,
            name=user.name,
            status=user.status,
        )
        raw_refresh_token, _ = await create_and_store_refresh_token(
            db=db, user_id=user.id
        )

        # Build redirect target
        if user.status == "pending_consent":
            target_url = f"/consent?next={urllib.parse.quote(next_url)}"
        else:
            target_url = next_url

        redirect_res = RedirectResponse(
            url=target_url, status_code=status.HTTP_302_FOUND
        )
        set_auth_cookies(redirect_res, access_token_jwt, raw_refresh_token)
        return redirect_res

    except AccountLinkingRequiredError as e:
        logger.info("Account linking required: %s", e)
        email_param = urllib.parse.quote(provider_email or "")
        return RedirectResponse(
            url=f"/login?error=linking_required&email={email_param}"
        )
    except AccountSuspendedError:
        return RedirectResponse(url="/login?error=account_suspended")
    except AccountDeletedError:
        return RedirectResponse(url="/login?error=account_deleted")
    except Exception as e:
        logger.exception("Unexpected error in social callback: %s", e)
        return RedirectResponse(url="/login?error=oauth_failed")


# =========================================================================
# Mobile Social Login Exchange (Expo SecureStore)
# =========================================================================


@router.post("/{provider}/mobile", response_model=TokenResponse)
async def mobile_social_exchange(
    provider: str,
    req: MobileOAuthExchangeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    provider = provider.lower().strip()
    if provider not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Invalid provider")

    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            if provider == "google":
                token_resp = await http_client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "code": req.code,
                        "code_verifier": req.code_verifier,
                        "grant_type": "authorization_code",
                        "redirect_uri": req.redirect_uri
                        or settings.OAUTH_REDIRECT_BASE_URL,
                    },
                )
                if token_resp.status_code != 200:
                    raise HTTPException(
                        status_code=400, detail="Google mobile token exchange failed"
                    )
                token_data = token_resp.json()
                id_token = token_data.get("id_token")
                claims = jwt.decode(id_token, options={"verify_signature": False})

                provider_user_id = str(claims.get("sub"))
                provider_email = claims.get("email")
                email_verified = bool(claims.get("email_verified", False))
                name = claims.get("name") or (
                    provider_email.split("@")[0] if provider_email else "User"
                )
                avatar_url = claims.get("picture")

            else:  # github
                token_resp = await http_client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "code": req.code,
                        "redirect_uri": req.redirect_uri,
                    },
                )
                if token_resp.status_code != 200:
                    raise HTTPException(
                        status_code=400, detail="GitHub mobile token exchange failed"
                    )
                token_data = token_resp.json()
                access_token = token_data.get("access_token")
                if not access_token:
                    raise HTTPException(
                        status_code=400, detail="No access token received from GitHub"
                    )

                (
                    gh_user,
                    verified_email,
                    is_verified,
                ) = await fetch_github_user_and_primary_email(
                    access_token=access_token,
                    http_client=http_client,
                )
                provider_user_id = str(gh_user["id"])
                provider_email = verified_email
                email_verified = is_verified
                name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
                avatar_url = gh_user.get("avatar_url")

        user, _, _ = await resolve_or_create_social_user(
            db=db,
            provider=provider,
            provider_user_id=provider_user_id,
            provider_email=provider_email,
            email_verified=email_verified,
            name=name,
            avatar_url=avatar_url,
        )

        access_token_jwt, expires_in = create_user_access_token(
            user_id=user.id,
            email=user.email,
            name=user.name,
            status=user.status,
        )
        raw_refresh_token, _ = await create_and_store_refresh_token(
            db=db, user_id=user.id
        )
        user_resp = await build_user_response(db, user)

        return TokenResponse(
            access_token=access_token_jwt,
            refresh_token=raw_refresh_token,
            expires_in=expires_in,
            user=user_resp,
        )
    except AccountLinkingRequiredError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        ) from e
    except (AccountSuspendedError, AccountDeletedError) as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


# =========================================================================
# Email / Password Register & Login
# =========================================================================


@router.post("/register", response_model=TokenResponse)
async def register_email(
    req: UserRegisterRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    norm_email = req.email.strip().lower()

    # Check for existing user
    stmt = select(User).where(func.lower(User.email) == norm_email)
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Create user with pending_consent until DPDPA agreement
    pwd_hash = hash_password(req.password)
    user = User(
        name=req.name.strip(),
        email=norm_email,
        email_verified=False,
        password_hash=pwd_hash,
        status="pending_consent",
        source="email",
        last_seen_at=utc_now(),
    )
    db.add(user)
    await db.flush()

    # Create password identity row
    ident = Identity(
        user_id=user.id,
        provider="password",
        provider_user_id=user.id,
        email_at_link=norm_email,
    )
    db.add(ident)
    await db.commit()
    await db.refresh(user)

    access_token, expires_in = create_user_access_token(
        user_id=user.id,
        email=user.email,
        name=user.name,
        status=user.status,
    )
    refresh_token, _ = await create_and_store_refresh_token(db=db, user_id=user.id)
    set_auth_cookies(response, access_token, refresh_token)
    user_resp = await build_user_response(db, user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=user_resp,
    )


@router.post("/login", response_model=TokenResponse)
async def login_email(
    req: UserLoginRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    norm_email = req.email.strip().lower()
    stmt = select(User).where(func.lower(User.email) == norm_email)
    res = await db.execute(stmt)
    user = res.scalars().first()

    if not user or not user.password_hash:
        verify_dummy_password(req.password)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended"
        )
    if user.status == "deleted":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Account has been deleted"
        )

    user.last_seen_at = utc_now()
    await db.commit()

    access_token, expires_in = create_user_access_token(
        user_id=user.id,
        email=user.email,
        name=user.name,
        status=user.status,
    )
    refresh_token, _ = await create_and_store_refresh_token(db=db, user_id=user.id)
    set_auth_cookies(response, access_token, refresh_token)
    user_resp = await build_user_response(db, user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in,
        user=user_resp,
    )


# =========================================================================
# DPDPA Consent
# =========================================================================


@router.post("/consent", response_model=ConsentResponse)
async def handle_consent(
    req: ConsentRequest,
    response: Response,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ConsentResponse:
    if not req.accepted:
        # Declining consent deletes pending user per DPDPA requirements
        await db.delete(current_user)
        await db.commit()
        clear_auth_cookies(response)
        return ConsentResponse(
            status="declined",
            policy_version=req.policy_version,
            user_status="deleted",
            message="Consent was declined. Your account has been removed.",
        )

    # Consent accepted
    consent = Consent(
        user_id=current_user.id,
        policy_version=req.policy_version,
        purposes="essential,quiz_analytics",
    )
    db.add(consent)
    current_user.status = "active"
    await db.commit()
    await db.refresh(current_user)

    # Update cookies with active user token
    access_token, _ = create_user_access_token(
        user_id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        status="active",
    )
    refresh_token, _ = await create_and_store_refresh_token(
        db=db, user_id=current_user.id
    )
    set_auth_cookies(response, access_token, refresh_token)

    return ConsentResponse(
        status="accepted",
        policy_version=req.policy_version,
        user_status="active",
        message="Consent granted successfully. Account activated.",
    )


# =========================================================================
# User Profile & Connected Identities
# =========================================================================


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    return await build_user_response(db, current_user)


@router.get("/identities", response_model=list[UserIdentityResponse])
async def list_identities(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserIdentityResponse]:
    identities, _ = await get_user_identities_and_methods(db, current_user.id)
    return [
        UserIdentityResponse(
            provider=i.provider,
            provider_user_id=i.provider_user_id,
            email_at_link=i.email_at_link,
            created_at=i.created_at,
        )
        for i in identities
    ]


@router.delete("/identities/{provider}", response_model=MessageResponse)
async def unlink_provider(
    provider: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    provider = provider.lower().strip()
    try:
        await unlink_identity_from_user(
            db=db, user_id=current_user.id, provider=provider
        )
        return MessageResponse(message=f"Successfully disconnected {provider}.")
    except UnlinkNotAllowedError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


# =========================================================================
# Token Refresh & Rotation (with Reuse Detection)
# =========================================================================


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    body_refresh_token: str | None = None,
) -> TokenResponse:
    raw_token = body_refresh_token or request.cookies.get(COOKIE_REFRESH_NAME)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token",
        )

    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    stmt = select(UserRefreshToken).where(UserRefreshToken.token_hash == token_hash)
    res = await db.execute(stmt)
    token_record = res.scalars().first()

    if not token_record:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Reuse detection: if token is already revoked, an attacker/compromised token is reused!
    if token_record.is_revoked:
        logger.warning(
            "Refresh token reuse detected for family %s! Revoking entire family.",
            token_record.family_id,
        )
        revoke_family_stmt = (
            update(UserRefreshToken)
            .where(UserRefreshToken.family_id == token_record.family_id)
            .values(is_revoked=True)
        )
        await db.execute(revoke_family_stmt)
        await db.commit()
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse detected. All sessions in this family have been revoked.",
        )

    # Expiration check
    expires_at = token_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=datetime.UTC)
    if utc_now() >= expires_at:
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    # Fetch user
    user_stmt = select(User).where(User.id == token_record.user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalars().first()
    if not user or user.status in ("suspended", "deleted"):
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account invalid or inactive",
        )

    # Rotate: revoke current token and issue new token with same family_id
    token_record.is_revoked = True
    new_raw_token, _ = await create_and_store_refresh_token(
        db=db,
        user_id=user.id,
        family_id=token_record.family_id,
    )

    access_token, expires_in = create_user_access_token(
        user_id=user.id,
        email=user.email,
        name=user.name,
        status=user.status,
    )
    set_auth_cookies(response, access_token, new_raw_token)
    user_resp = await build_user_response(db, user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_raw_token,
        expires_in=expires_in,
        user=user_resp,
    )


# =========================================================================
# Logout
# =========================================================================


@router.post("/logout", response_model=MessageResponse)
async def logout(
    request: Request,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    raw_token = request.cookies.get(COOKIE_REFRESH_NAME)
    if raw_token:
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        stmt = (
            update(UserRefreshToken)
            .where(UserRefreshToken.token_hash == token_hash)
            .values(is_revoked=True)
        )
        await db.execute(stmt)
        await db.commit()

    clear_auth_cookies(response)
    return MessageResponse(message="Successfully logged out.")
