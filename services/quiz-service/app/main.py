from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.admin_quiz import router as admin_quiz_router
from app.routers.health import router as health_router

app = FastAPI(
    title="FastQuiz Quiz Service",
    description="Topics, Quizzes, Questions, Attempts & Realtime Timer Service",
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
app.include_router(admin_quiz_router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "FastQuiz Quiz Service is running. Visit /docs or /health"}
