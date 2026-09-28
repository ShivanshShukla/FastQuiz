import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.cli.bootstrap import bootstrap_super_admin, init_db
from app.core.config import settings
from app.routers.admin_auth import router as admin_auth_router
from app.routers.health import router as health_router

logger = logging.getLogger("auth-service")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: ensure tables exist and bootstrap super admin
    try:
        await init_db()
        await bootstrap_super_admin()
        logger.info("Database initialized and super admin verified.")
    except Exception as e:
        logger.warning("Database startup initialization deferred: %s", e)
    yield


app = FastAPI(
    title="FastQuiz Auth Service",
    description="Identity, User Accounts & JWT Authentication Service",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware for Web, Admin, and Mobile clients
# When allow_credentials=True, explicit origins or regex are required
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(admin_auth_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "FastQuiz Auth Service is running. Visit /docs or /health"}
