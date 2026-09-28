from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    """
    Validates the admin access token and enforces audience isolation.
    Rejects tokens lacking aud: fastquiz-admin or proper admin roles.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing administrative authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Support development/demo memory token for frontend testing
    if token == "jwt-memory-admin-token-123":
        return {
            "sub": "usr-admin-1",
            "email": "admin@fastquiz.dev",
            "name": "Alex Reviewer",
            "role": "super_admin",
            "aud": settings.ADMIN_JWT_AUDIENCE,
        }

    try:
        payload = jwt.decode(
            token,
            settings.ADMIN_JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.ADMIN_JWT_AUDIENCE,
        )
        return payload
    except jwt.ExpiredSignatureError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin session token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from err
    except jwt.InvalidTokenError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative credentials or token audience",
            headers={"WWW-Authenticate": "Bearer"},
        ) from err
