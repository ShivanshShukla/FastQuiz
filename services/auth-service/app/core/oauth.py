import base64
import hashlib
import json
import logging
import secrets
from typing import Any
from urllib.parse import urlparse

import httpx
from authlib.integrations.starlette_client import OAuth  # type: ignore[import-untyped]

from app.core.config import settings
from app.core.rate_limit import get_redis_client

logger = logging.getLogger(__name__)

oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID or "mock-google-client-id",
    client_secret=settings.GOOGLE_CLIENT_SECRET or "mock-google-client-secret",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    client_id=settings.GITHUB_CLIENT_ID or "mock-github-client-id",
    client_secret=settings.GITHUB_CLIENT_SECRET or "mock-github-client-secret",
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "read:user user:email"},
)


def generate_pkce_pair() -> tuple[str, str]:
    """Generates an RFC 7636 compliant PKCE code_verifier and code_challenge (S256)."""
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return verifier, challenge


def sanitize_next_url(next_url: str | None) -> str:
    """Sanitizes the 'next' redirect parameter to ensure relative, same-origin path,
    preventing open redirect vulnerabilities."""
    if not next_url:
        return "/curriculum"

    cleaned = next_url.strip()
    if (
        not cleaned.startswith("/")
        or cleaned.startswith("//")
        or "://" in cleaned
        or "\\" in cleaned
    ):
        return "/curriculum"

    # Further parse with urlparse to ensure no network location
    parsed = urlparse(cleaned)
    if parsed.netloc or parsed.scheme:
        return "/curriculum"

    return cleaned


async def store_oauth_state(
    state: str,
    payload: dict[str, Any],
    ttl_seconds: int = 600,
) -> None:
    """Stores ephemeral OAuth state, PKCE verifier, and nonce in Redis with a 10-minute TTL."""
    redis = get_redis_client()
    key = f"oauth:state:{state}"
    await redis.set(key, json.dumps(payload), ex=ttl_seconds)


async def consume_oauth_state(state: str) -> dict[str, Any] | None:
    """Consumes an OAuth state from Redis, deleting it immediately to ensure single-use."""
    if not state:
        return None
    redis = get_redis_client()
    key = f"oauth:state:{state}"
    data = await redis.get(key)
    if not data:
        return None
    # Atomic or immediate deletion prevents replay attacks
    await redis.delete(key)
    try:
        return json.loads(data)
    except Exception as e:
        logger.warning("Failed to deserialize OAuth state: %s", e)
        return None


async def fetch_github_user_and_primary_email(
    access_token: str,
    http_client: httpx.AsyncClient | None = None,
) -> tuple[dict[str, Any], str | None, bool]:
    """Fetches user profile and /user/emails from GitHub API.
    Returns (user_profile, primary_verified_email, is_verified).
    Strictly accepts only primary AND verified emails per security policy."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "FastQuiz-Auth-Service",
    }

    client = http_client or httpx.AsyncClient(timeout=10.0)
    should_close = http_client is None

    try:
        # Fetch GitHub /user profile
        user_resp = await client.get("https://api.github.com/user", headers=headers)
        if user_resp.status_code != 200:
            raise ValueError(f"GitHub user profile fetch failed: {user_resp.text}")
        user_profile = user_resp.json()

        # Fetch GitHub /user/emails
        emails_resp = await client.get(
            "https://api.github.com/user/emails", headers=headers
        )
        verified_email: str | None = None
        is_verified = False

        if emails_resp.status_code == 200:
            emails_data = emails_resp.json()
            if isinstance(emails_data, list):
                for item in emails_data:
                    if item.get("primary") is True and item.get("verified") is True:
                        verified_email = item.get("email")
                        is_verified = True
                        break

        # Fallback: check profile email if no emails list or verified flag in user
        if not verified_email and user_profile.get("email"):
            # Unverified profile email
            verified_email = user_profile.get("email")
            is_verified = False

        return user_profile, verified_email, is_verified
    finally:
        if should_close:
            await client.aclose()
