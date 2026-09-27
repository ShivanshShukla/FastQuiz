from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SERVICE_NAME: str = "payments-service"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8003

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/fastquiz_payments"
    )

    # Message Broker
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # Payment Gateway Configuration
    PAYMENT_PROVIDER: str = "razorpay"
    PAYMENT_KEY_ID: str = "rzp_test_placeholder"
    PAYMENT_KEY_SECRET: str = "rzp_test_secret_placeholder"
    WEBHOOK_SECRET: str = "dev-webhook-secret-placeholder"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
