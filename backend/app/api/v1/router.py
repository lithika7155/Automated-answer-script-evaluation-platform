from fastapi import APIRouter
from app.api.v1.endpoints import (
    admin,
    analytics,
    answer_scripts,
    auth,
    evaluations,
    health,
    users,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(
    answer_scripts.router, prefix="/answer-scripts", tags=["Answer Scripts"]
)
api_router.include_router(
    evaluations.router, prefix="/evaluations", tags=["AI Evaluations"]
)
api_router.include_router(
    analytics.router, prefix="/analytics", tags=["Results & Analytics"]
)
api_router.include_router(
    admin.router, prefix="/admin", tags=["Admin Dashboard & Management"]
)
