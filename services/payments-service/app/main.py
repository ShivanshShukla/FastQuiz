from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.admin_payments import router as admin_payments_router
from app.routers.health import router as health_router
from app.routers.webhooks import router as webhooks_router

app = FastAPI(
    title="FastQuiz Payments Service",
    description="Purchases, Bundles & Payment Webhook Service",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(admin_payments_router)
app.include_router(webhooks_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "FastQuiz Payments Service is running. Visit /docs or /health"}
