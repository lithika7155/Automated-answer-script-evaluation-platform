from fastapi import APIRouter

from presentation.api.v1.questions import router as questions_router
from presentation.api.v1.ai import router as ai_router
from presentation.api.v1.export import router as export_router
from presentation.api.v1.users import router as users_router

api_router = APIRouter()

api_router.include_router(questions_router)
api_router.include_router(ai_router)
api_router.include_router(export_router)
api_router.include_router(users_router)
