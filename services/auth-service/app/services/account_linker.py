import datetime
import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import Identity, User

logger = logging.getLogger(__name__)


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


class AccountLinkingError(Exception):
    """Base class for account linking exceptions."""

    pass


class AccountLinkingRequiredError(AccountLinkingError):
    """Raised when an existing email is found but either side is unverified (Rule 3)."""

    pass


class UnlinkNotAllowedError(AccountLinkingError):
    """Raised when attempting to disconnect the last remaining login method (Rule 6)."""

    pass


class AccountSuspendedError(AccountLinkingError):
    """Raised when account is suspended."""

    pass


class AccountDeletedError(AccountLinkingError):
    """Raised when account is deleted."""

    pass


async def resolve_or_create_social_user(
    db: AsyncSession,
    provider: str,
    provider_user_id: str,
    provider_email: str | None,
    email_verified: bool,
    name: str,
    avatar_url: str | None = None,
) -> tuple[User, bool, str]:
    """Resolves or provisions a user following the 6 strict security linking rules.
    Returns: (user, is_linked_to_existing, status)
    """
    normalized_email = provider_email.strip().lower() if provider_email else None

    # Rule 1: Check if an identity (provider, provider_user_id) already exists
    ident_stmt = select(Identity).where(
        Identity.provider == provider,
        Identity.provider_user_id == provider_user_id,
    )
    ident_res = await db.execute(ident_stmt)
    existing_ident = ident_res.scalars().first()

    if existing_ident:
        user_stmt = select(User).where(User.id == existing_ident.user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalars().first()
        if not user:
            raise ValueError(
                f"Orphaned identity found for user {existing_ident.user_id}"
            )

        if user.status == "suspended":
            raise AccountSuspendedError("This account has been suspended.")
        if user.status == "deleted":
            raise AccountDeletedError("This account has been deleted.")

        # Update metadata
        user.last_seen_at = utc_now()
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url
        if email_verified and not user.email_verified:
            user.email_verified = True
        await db.commit()
        await db.refresh(user)
        return user, False, user.status

    # Rule 2 & 3: Identity not found, check if user exists by verified email
    if normalized_email:
        user_stmt = select(User).where(func.lower(User.email) == normalized_email)
        user_res = await db.execute(user_stmt)
        existing_user = user_res.scalars().first()

        if existing_user:
            if existing_user.status == "suspended":
                raise AccountSuspendedError("This account has been suspended.")
            if existing_user.status == "deleted":
                raise AccountDeletedError("This account has been deleted.")

            # Check verification on both sides
            if email_verified and existing_user.email_verified:
                # Rule 2: Both verified -> safely auto-link new identity
                new_ident = Identity(
                    user_id=existing_user.id,
                    provider=provider,
                    provider_user_id=provider_user_id,
                    email_at_link=normalized_email,
                )
                db.add(new_ident)
                if not existing_user.avatar_url and avatar_url:
                    existing_user.avatar_url = avatar_url
                existing_user.last_seen_at = utc_now()
                await db.commit()
                await db.refresh(existing_user)
                logger.info(
                    "Auto-linked %s identity (%s) to existing verified user %s",
                    provider,
                    provider_user_id,
                    existing_user.id,
                )
                return existing_user, True, existing_user.status
            else:
                # Rule 3: Either side is unverified -> reject auto-link!
                logger.warning(
                    "Account linking rejected for %s: provider_verified=%s, user_verified=%s",
                    normalized_email,
                    email_verified,
                    existing_user.email_verified,
                )
                raise AccountLinkingRequiredError(
                    "An account with this email address already exists. "
                    "Please log in with your existing credentials first, then connect this provider in Settings."
                )

    # Rule 4 & 5: No matching identity, no matching email -> create new user (pending_consent)
    user_name = (
        name.strip()
        if name and name.strip()
        else (normalized_email.split("@")[0] if normalized_email else "User")
    )
    new_user = User(
        name=user_name,
        email=normalized_email,
        email_verified=email_verified,
        avatar_url=avatar_url,
        status="pending_consent",
        source=provider,
        last_seen_at=utc_now(),
    )
    db.add(new_user)
    await db.flush()

    new_ident = Identity(
        user_id=new_user.id,
        provider=provider,
        provider_user_id=provider_user_id,
        email_at_link=normalized_email,
    )
    db.add(new_ident)
    await db.commit()
    await db.refresh(new_user)
    logger.info(
        "Created new user %s (pending_consent) with %s identity",
        new_user.id,
        provider,
    )
    return new_user, False, "pending_consent"


async def link_identity_to_user(
    db: AsyncSession,
    user_id: str,
    provider: str,
    provider_user_id: str,
    provider_email: str | None,
) -> Identity:
    """Manually links an identity to an authenticated user (from Settings)."""
    # Check if this identity is already linked to another user
    stmt = select(Identity).where(
        Identity.provider == provider,
        Identity.provider_user_id == provider_user_id,
    )
    res = await db.execute(stmt)
    existing = res.scalars().first()

    if existing:
        if existing.user_id == user_id:
            return existing
        raise AccountLinkingError(
            "This provider account is already connected to another FastQuiz user."
        )

    new_identity = Identity(
        user_id=user_id,
        provider=provider,
        provider_user_id=provider_user_id,
        email_at_link=provider_email.strip().lower() if provider_email else None,
    )
    db.add(new_identity)
    await db.commit()
    await db.refresh(new_identity)
    return new_identity


async def unlink_identity_from_user(
    db: AsyncSession,
    user_id: str,
    provider: str,
) -> None:
    """Unlinks a provider identity, enforcing Rule 6: never disconnect the last login method."""
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalars().first()
    if not user:
        raise ValueError(f"User {user_id} not found")

    # Fetch all identities for this user
    ident_stmt = select(Identity).where(Identity.user_id == user_id)
    ident_res = await db.execute(ident_stmt)
    identities = ident_res.scalars().all()

    target_ident = next((i for i in identities if i.provider == provider), None)
    if not target_ident:
        raise ValueError(f"Provider '{provider}' is not linked to this account.")

    has_password = bool(user.password_hash and len(user.password_hash) > 0)
    total_methods = len(identities) + (1 if has_password else 0)

    # Rule 6: Never allow unlinking the last remaining login method
    if total_methods <= 1:
        raise UnlinkNotAllowedError(
            "Cannot disconnect your only remaining sign-in method. "
            "Please connect another login provider or set a password first."
        )

    await db.delete(target_ident)
    await db.commit()
    logger.info("Unlinked %s identity from user %s", provider, user_id)


async def get_user_identities_and_methods(
    db: AsyncSession,
    user_id: str,
) -> tuple[list[Identity], bool]:
    """Returns all identities linked to the user along with a boolean indicating if a password is set."""
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalars().first()
    if not user:
        return [], False

    ident_stmt = select(Identity).where(Identity.user_id == user_id)
    ident_res = await db.execute(ident_stmt)
    identities = ident_res.scalars().all()

    has_password = bool(user.password_hash and len(user.password_hash) > 0)
    return list(identities), has_password
