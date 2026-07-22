import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from core.config import get_settings
from core.database import connect_db, close_db, get_db
from core.logging_config import setup_logging
from core.exceptions import (
    QuestionNotFoundError, QuestionAlreadyExistsError,
    AIServiceError, InvalidHintLevelError, DatabaseError
)
from presentation.api.v1.router import api_router

setup_logging()
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    # Create indexes on startup
    from infrastructure.repositories.mongo_question_repo import MongoQuestionRepository
    from core.database import get_collection
    repo = MongoQuestionRepository(get_collection("questions"))
    await repo.create_indexes()
    yield
    # Shutdown
    await close_db()

from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from core.rate_limiter import limiter

app = FastAPI(
    title="AI Interview Preparation Platform",
    description="Backend API for storing DSA questions and AI-powered interview practice.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(QuestionNotFoundError)
async def question_not_found_handler(request: Request, exc: QuestionNotFoundError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(QuestionAlreadyExistsError)
async def question_exists_handler(request: Request, exc: QuestionAlreadyExistsError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(AIServiceError)
async def ai_service_handler(request: Request, exc: AIServiceError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(InvalidHintLevelError)
async def invalid_hint_handler(request: Request, exc: InvalidHintLevelError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Include Routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint to verify API and Database connectivity."""
    db = get_db()
    db_status = "ok"
    try:
        await db.command("ping")
    except Exception:
        db_status = "error"
        
    return {
        "status": "ok",
        "database": db_status,
        "environment": settings.app_env
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_env == "development"
    )
