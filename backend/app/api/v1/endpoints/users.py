from typing import List
from fastapi import APIRouter, Depends, status
from app.api.dependencies.auth import get_user_repository, require_roles
from app.application.dtos.user import UserResponseDTO
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User, UserRole

router = APIRouter()


@router.get(
    "",
    response_model=List[UserResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List all registered users (Admin only)",
)
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    user_repo: IUserRepository = Depends(get_user_repository),
) -> List[UserResponseDTO]:
    users = await user_repo.list_all(skip=skip, limit=limit)
    return [
        UserResponseDTO(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
        )
        for u in users
    ]
