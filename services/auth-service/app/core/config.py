from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SERVICE_NAME: str = "auth-service"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8001

    # Database & Redis
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/fastquiz_auth"
    )
    REDIS_URL: str = "redis://localhost:6379/0"

    # Learner JWT Authentication
    JWT_SECRET: str = "dev-secret-key-change-in-production-12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Admin Identity & Isolation Settings
    ADMIN_JWT_SECRET: str = "admin-secret-key-change-in-production-67890"
    ADMIN_JWT_AUDIENCE: str = "fastquiz-admin"
    ADMIN_JWT_PREAUTH_AUDIENCE: str = "fastquiz-admin-preauth"
    ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    ADMIN_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_PREAUTH_TOKEN_EXPIRE_MINUTES: int = 5

    # Rate Limiting & Lockout
    ADMIN_MAX_FAILED_ATTEMPTS_PER_IP: int = 10
    ADMIN_MAX_FAILED_ATTEMPTS_PER_ACCOUNT: int = 5
    ADMIN_LOCKOUT_DURATION_SECONDS: int = 900  # 15 minutes

    # Bootstrap Super Admin Credentials
    BOOTSTRAP_ADMIN_EMAIL: str = "admin@fastquiz.dev"
    BOOTSTRAP_ADMIN_PASSWORD: str = "AdminSecret123!"
    BOOTSTRAP_ADMIN_NAME: str = "Primary Super Admin"

    # TOTP Encryption Key (AES-256 key, base64 or 32 bytes)
    TOTP_ENCRYPTION_KEY: str = "c2VjcmV0LWtleS0zMi1ieXRlcy1mb3ItYWVzLWdjbS0xMjM="

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
