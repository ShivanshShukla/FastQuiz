import datetime
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default="active", nullable=False
    )  # "pending_consent" | "active" | "suspended" | "deleted"
    source: Mapped[str] = mapped_column(
        String(32), default="email", nullable=False
    )  # "email" | "google" | "github"
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    last_seen_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    identities: Mapped[list["Identity"]] = relationship(
        "Identity",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Identity.created_at)",
    )

    consents: Mapped[list["Consent"]] = relationship(
        "Consent",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Consent.granted_at)",
    )

    notes: Mapped[list["AdminNote"]] = relationship(
        "AdminNote",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(AdminNote.created_at)",
    )

    refresh_tokens: Mapped[list["UserRefreshToken"]] = relationship(
        "UserRefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(UserRefreshToken.created_at)",
    )


class Identity(Base):
    __tablename__ = "identities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider: Mapped[str] = mapped_column(
        String(32), nullable=False
    )  # "google" | "github" | "password"
    provider_user_id: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # google sub, github numeric id, or user_id for password
    email_at_link: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "provider", "provider_user_id", name="uq_identities_provider_user_id"
        ),
    )

    user: Mapped["User"] = relationship("User", back_populates="identities")


class Consent(Base):
    __tablename__ = "consents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    policy_version: Mapped[str] = mapped_column(
        String(32), nullable=False
    )  # e.g. "2026.1"
    purposes: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # e.g. "essential,analytics,proctoring"
    granted_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    withdrawn_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="consents")


class UserRefreshToken(Base):
    __tablename__ = "user_refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True, index=True
    )  # SHA-256 hash of refresh token
    family_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True
    )  # Family ID for rotation & reuse detection
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    expires_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")


class AdminNote(Base):
    __tablename__ = "admin_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    admin_id: Mapped[str] = mapped_column(String(36), nullable=False)
    admin_name: Mapped[str] = mapped_column(String(255), nullable=False)
    admin_role: Mapped[str] = mapped_column(String(32), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="notes")
