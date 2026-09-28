import logging
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis client singleton
_redis_client: aioredis.Redis | None = None


def get_redis_client() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
    return _redis_client


def set_redis_client(client: Any) -> None:
    """Allows injecting fakeredis or test client during testing."""
    global _redis_client
    _redis_client = client


class AdminRateLimiter:
    """Rate limits and account lockout manager backed by Redis."""

    def __init__(self, redis_client: aioredis.Redis | None = None) -> None:
        self._redis = redis_client

    @property
    def redis(self) -> aioredis.Redis:
        if self._redis is not None:
            return self._redis
        return get_redis_client()

    def _normalize_email(self, email: str) -> str:
        return email.strip().lower()

    async def is_locked_out(self, ip: str, email: str) -> tuple[bool, int]:
        """Checks if the account or IP is currently locked out.
        Returns (is_locked, remaining_seconds)."""
        norm_email = self._normalize_email(email)
        account_lock_key = f"lockout:admin:account:{norm_email}"
        ip_lock_key = f"lockout:admin:ip:{ip}"

        try:
            account_ttl = await self.redis.ttl(account_lock_key)
            if account_ttl > 0:
                return True, account_ttl

            ip_ttl = await self.redis.ttl(ip_lock_key)
            if ip_ttl > 0:
                return True, ip_ttl
        except Exception as e:
            logger.warning("Redis unavailable during lockout check: %s", e)

        return False, 0

    async def record_failure(self, ip: str, email: str) -> tuple[bool, int]:
        """Records a failed login attempt for an IP and account.
        If thresholds are breached, triggers a 15-minute temporary lockout.
        Returns (is_now_locked, remaining_attempts_before_lockout)."""
        norm_email = self._normalize_email(email)
        account_fail_key = f"fail:admin:account:{norm_email}"
        ip_fail_key = f"fail:admin:ip:{ip}"
        account_lock_key = f"lockout:admin:account:{norm_email}"
        ip_lock_key = f"lockout:admin:ip:{ip}"

        window = settings.ADMIN_LOCKOUT_DURATION_SECONDS  # 15 min

        try:
            # Increment account failures
            account_fails = await self.redis.incr(account_fail_key)
            if account_fails == 1:
                await self.redis.expire(account_fail_key, window)

            # Increment IP failures
            ip_fails = await self.redis.incr(ip_fail_key)
            if ip_fails == 1:
                await self.redis.expire(ip_fail_key, window)

            # Check if threshold reached
            if account_fails >= settings.ADMIN_MAX_FAILED_ATTEMPTS_PER_ACCOUNT:
                await self.redis.set(account_lock_key, "locked", ex=window)
                await self.redis.delete(account_fail_key)
                return True, 0

            if ip_fails >= settings.ADMIN_MAX_FAILED_ATTEMPTS_PER_IP:
                await self.redis.set(ip_lock_key, "locked", ex=window)
                await self.redis.delete(ip_fail_key)
                return True, 0

            remaining = max(
                0, settings.ADMIN_MAX_FAILED_ATTEMPTS_PER_ACCOUNT - account_fails
            )
            return False, remaining
        except Exception as e:
            logger.warning("Redis error recording failure: %s", e)
            return False, 5

    async def reset_failures(self, ip: str, email: str) -> None:
        """Clears failure counters and lockout flags upon successful authentication."""
        norm_email = self._normalize_email(email)
        account_fail_key = f"fail:admin:account:{norm_email}"
        ip_fail_key = f"fail:admin:ip:{ip}"
        account_lock_key = f"lockout:admin:account:{norm_email}"
        ip_lock_key = f"lockout:admin:ip:{ip}"

        try:
            await self.redis.delete(
                account_fail_key, ip_fail_key, account_lock_key, ip_lock_key
            )
        except Exception as e:
            logger.warning("Redis error resetting failures: %s", e)
