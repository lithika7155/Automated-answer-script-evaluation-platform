from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.core.rate_limiter import rate_limiter
from app.domain.exceptions.handlers import register_exception_handlers
from app.infrastructure.database.base import Base
from app.infrastructure.database.mongodb import mongodb_manager
from app.infrastructure.database.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Initializing Automated Answer Script Evaluation Platform Backend...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Relational Database schemas initialized.")

    await mongodb_manager.connect()

    yield

    logger.info("Shutting down FastAPI Backend...")
    await mongodb_manager.disconnect()


def create_application() -> FastAPI:
    tags_metadata = [
        {
            "name": "Health",
            "description": "System health and operational monitoring status endpoints.",
        },
        {
            "name": "Authentication",
            "description": "User registration, JWT token login, and profile operations.",
        },
        {
            "name": "Users",
            "description": "User account management and listing.",
        },
        {
            "name": "Answer Scripts",
            "description": "PDF and Image answer script upload, retrieval, download, and deletion.",
        },
        {
            "name": "AI Evaluations",
            "description": "Gemini AI automated answer evaluation against model answer keys.",
        },
        {
            "name": "Results & Analytics",
            "description": "Student results, grade calculation, exam analytics, leaderboard, JSON & PDF export.",
        },
        {
            "name": "Admin Dashboard & Management",
            "description": "System administration, dashboard metrics, and user status controls.",
        },
    ]

    app = FastAPI(
        title="Automated Answer Script Evaluation Platform API",
        description=(
            "An enterprise-grade Clean Architecture REST API backend for automated answer script "
            "evaluation using Gemini AI, OCR ingestion, letter grading, exam analytics, "
            "PDF report generation, and student leaderboards."
        ),
        version="1.0.0",
        openapi_tags=tags_metadata,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
        dependencies=[Depends(rate_limiter)],
    )

    register_exception_handlers(app)

    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
