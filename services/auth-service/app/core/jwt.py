import datetime
from typing import Any

import jwt

from app.core.config import settings


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


def create_admin_access_token(
    admin_id: str, email: str, role: str, name: str
) -> tuple[str, int]:
    """Issues a short-lived (15 min) access token with audience 'fastquiz-admin'."""
    expires_delta = datetime.timedelta(
        minutes=settings.ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire_time = utc_now() + expires_delta

    payload: dict[str, Any] = {
        "sub": admin_id,
        "email": email,
        "name": name,
        "role": role,
        "aud": settings.ADMIN_JWT_AUDIENCE,  # "fastquiz-admin"
        "iss": "fastquiz-auth-service",
        "iat": utc_now(),
        "exp": expire_time,
    }

    token = jwt.encode(
        payload, settings.ADMIN_JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    expires_in_seconds = int(expires_delta.total_seconds())
    return token, expires_in_seconds


def create_admin_preauth_token(admin_id: str, email: str) -> tuple[str, int]:
    """Issues a 5-minute pre-auth token specifically for the TOTP challenge step."""
    expires_delta = datetime.timedelta(
        minutes=settings.ADMIN_PREAUTH_TOKEN_EXPIRE_MINUTES
    )
    expire_time = utc_now() + expires_delta

    payload: dict[str, Any] = {
        "sub": admin_id,
        "email": email,
        "scope": "totp_pending",
        "aud": settings.ADMIN_JWT_PREAUTH_AUDIENCE,  # "fastquiz-admin-preauth"
        "iss": "fastquiz-auth-service",
        "iat": utc_now(),
        "exp": expire_time,
    }

    token = jwt.encode(
        payload, settings.ADMIN_JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    return token, int(expires_delta.total_seconds())


def decode_admin_token(token: str) -> dict[str, Any]:
    """Decodes and strictly verifies an admin access token with
    audience 'fastquiz-admin'. Rejects learner tokens or expired/tampered tokens."""
    return jwt.decode(
        token,
        settings.ADMIN_JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
        audience=settings.ADMIN_JWT_AUDIENCE,
        issuer="fastquiz-auth-service",
    )


def decode_admin_preauth_token(token: str) -> dict[str, Any]:
    """Decodes and verifies a pre-auth token for TOTP completion."""
    return jwt.decode(
        token,
        settings.ADMIN_JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
        audience=settings.ADMIN_JWT_PREAUTH_AUDIENCE,
        issuer="fastquiz-auth-service",
    )


def create_user_access_token(
    user_id: str,
    email: str | None,
    name: str,
    status: str,
) -> tuple[str, int]:
    """Issues a short-lived (15 min) access token for learners with audience 'fastquiz-learner'."""
    expires_delta = datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire_time = utc_now() + expires_delta

    payload: dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "name": name,
        "status": status,
        "aud": settings.LEARNER_JWT_AUDIENCE,  # "fastquiz-learner"
        "iss": "fastquiz-auth-service",
        "iat": utc_now(),
        "exp": expire_time,
    }

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    expires_in_seconds = int(expires_delta.total_seconds())
    return token, expires_in_seconds


def decode_user_token(token: str) -> dict[str, Any]:
    """Decodes and strictly verifies a learner access token with
    audience 'fastquiz-learner'. Rejects admin tokens or expired/tampered tokens."""
    return jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
        audience=settings.LEARNER_JWT_AUDIENCE,
        issuer="fastquiz-auth-service",
    )
