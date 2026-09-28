import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import AsyncSessionLocal, Base, engine
from app.core.security import hash_password
from app.models.admin import Admin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bootstrap")


async def init_db() -> None:
    """Creates database tables if they do not already exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def bootstrap_super_admin(session: AsyncSession | None = None) -> Admin:
    """Idempotently seeds the initial super admin
    from BOOTSTRAP_ADMIN_* environment variables."""
    own_session = False
    if session is None:
        session = AsyncSessionLocal()
        own_session = True

    try:
        # Check if any admin already exists
        result = await session.execute(select(Admin).limit(1))
        existing_admin = result.scalars().first()

        if existing_admin:
            logger.info(
                "Admin already exists (%s). Skipping bootstrap.", existing_admin.email
            )
            return existing_admin

        # Validate password length
        password = settings.BOOTSTRAP_ADMIN_PASSWORD
        if len(password) < 12:
            raise ValueError("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.")

        email = settings.BOOTSTRAP_ADMIN_EMAIL.strip().lower()
        name = settings.BOOTSTRAP_ADMIN_NAME.strip()
        pwd_hash = hash_password(password)

        super_admin = Admin(
            email=email,
            password_hash=pwd_hash,
            name=name,
            role="super_admin",
            is_active=True,
            totp_enabled=False,
        )

        session.add(super_admin)
        await session.commit()
        await session.refresh(super_admin)

        logger.info("Successfully bootstrapped initial Super Admin: %s", email)
        return super_admin
    finally:
        if own_session:
            await session.close()


async def main() -> None:
    await init_db()
    await bootstrap_super_admin()


if __name__ == "__main__":
    asyncio.run(main())
