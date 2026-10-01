import asyncio
import logging

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import AsyncSessionLocal, Base, engine
from app.core.security import hash_password
from app.models.admin import Admin
from app.models.user import Identity, User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bootstrap")


async def init_db() -> None:
    """Creates database tables if they do not already exist and applies schema updates."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if conn.dialect.name == "postgresql":
            migrations = [
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active' NOT NULL;",
                "ALTER TABLE users ALTER COLUMN email DROP NOT NULL;",
            ]
            for statement in migrations:
                try:
                    await conn.execute(text(statement))
                except Exception as ex:
                    logger.debug("Migration statement skipped: %s (%s)", statement, ex)


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


async def backfill_password_identities(session: AsyncSession | None = None) -> int:
    """Idempotently backfills Identity rows for existing users who have a password_hash."""
    own_session = False
    if session is None:
        session = AsyncSessionLocal()
        own_session = True

    try:
        # Find users with a password_hash
        stmt = select(User).where(User.password_hash.isnot(None))
        result = await session.execute(stmt)
        users = result.scalars().all()

        backfilled_count = 0
        for user in users:
            # Check if user already has a password identity
            ident_stmt = select(Identity).where(
                Identity.user_id == user.id,
                Identity.provider == "password",
            )
            ident_res = await session.execute(ident_stmt)
            existing_identity = ident_res.scalars().first()

            if not existing_identity:
                new_identity = Identity(
                    user_id=user.id,
                    provider="password",
                    provider_user_id=user.id,
                    email_at_link=user.email,
                )
                session.add(new_identity)
                backfilled_count += 1

        if backfilled_count > 0:
            await session.commit()
            logger.info("Backfilled %d password identities.", backfilled_count)
        else:
            logger.info("No password identities needed backfilling.")

        return backfilled_count
    finally:
        if own_session:
            await session.close()


async def main() -> None:
    await init_db()
    await bootstrap_super_admin()
    await backfill_password_identities()


if __name__ == "__main__":
    asyncio.run(main())
