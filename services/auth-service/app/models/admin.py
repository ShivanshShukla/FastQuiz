import datetime
import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(32), default="admin", nullable=False
    )  # "super_admin" | "admin"
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # 2FA (TOTP)
    totp_secret_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    totp_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    totp_recovery_codes_hashed: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON-encoded list of SHA-256 hashes

    last_login_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    refresh_tokens: Mapped[list["AdminRefreshToken"]] = relationship(
        "AdminRefreshToken", back_populates="admin", cascade="all, delete-orphan"
    )


class AdminRefreshToken(Base):
    __tablename__ = "admin_refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    admin_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("admins.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )  # SHA-256 hex digest
    expires_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    revoked_at: Mapped[datetime.datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)

    admin: Mapped["Admin"] = relationship("Admin", back_populates="refresh_tokens")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    admin_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    attempted_email: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )  # e.g., "login_success", "login_failed", "lockout", "logout", "token_refreshed"
    status: Mapped[str] = mapped_column(
        String(32), nullable=False
    )  # "success" | "failure"
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    details: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON-formatted string
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
