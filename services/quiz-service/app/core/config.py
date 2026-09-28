from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SERVICE_NAME: str = "quiz-service"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8002

    # Databases
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/fastquiz_quizzes"
    )
    MONGODB_URI: str = "mongodb://localhost:27017/fastquiz_questions"
    REDIS_URL: str = "redis://localhost:6379/1"

    # Message Broker
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # Quiz Domain Rules
    DEFAULT_DURATION_SECONDS: int = 900
    FREE_ATTEMPTS_PER_TOPIC: int = 1

    # Admin Authentication
    ADMIN_JWT_SECRET: str = "admin-secret-key-change-in-production-67890"
    ADMIN_JWT_AUDIENCE: str = "fastquiz-admin"
    JWT_ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
