from fastapi import APIRouter, Depends, Header, HTTPException, status
from typing import Optional

from presentation.schemas.user_schema import UserProfileResponse
from presentation.api.dependencies import get_user_repository
from domain.interfaces.user_repository import UserRepository
from application.use_cases.users import user_use_cases

router = APIRouter(prefix="/users", tags=["Users"])

def get_current_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    if not x_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="X-User-ID header missing")
    return x_user_id

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(
    user_id: str = Depends(get_current_user_id),
    repo: UserRepository = Depends(get_user_repository)
):
    """Get the current user's profile, including bookmarks and history."""
    return await user_use_cases.get_user_profile(user_id, repo)

@router.post("/bookmarks/{slug}", response_model=UserProfileResponse)
async def toggle_bookmark(
    slug: str,
    user_id: str = Depends(get_current_user_id),
    repo: UserRepository = Depends(get_user_repository)
):
    """Toggle a bookmark on a question slug."""
    return await user_use_cases.toggle_user_bookmark(user_id, slug, repo)

@router.get("/history", response_model=UserProfileResponse)
async def get_my_history(
    user_id: str = Depends(get_current_user_id),
    repo: UserRepository = Depends(get_user_repository)
):
    """Alias for /me to align with history explicitly if needed."""
    return await user_use_cases.get_user_profile(user_id, repo)
