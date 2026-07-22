from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_user_repository, require_roles
from app.application.dtos.admin import AdminDashboardDTO, UserStatusUpdateDTO
from app.application.dtos.user import UserResponseDTO
from app.application.use_cases.get_admin_dashboard import GetAdminDashboardUseCase
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User, UserRole
from app.infrastructure.database.mongodb import get_mongo_db
from app.infrastructure.repositories.mongo_answer_script_repository import (
    MongoAnswerScriptRepository,
)
from app.infrastructure.repositories.mongo_evaluation_repository import (
    MongoEvaluationRepository,
)

router = APIRouter()


def get_answer_script_repository() -> IAnswerScriptRepository:
    db = get_mongo_db()
    return MongoAnswerScriptRepository(db=db)


def get_evaluation_repository() -> IEvaluationRepository:
    db = get_mongo_db()
    return MongoEvaluationRepository(db=db)


@router.get(
    "/dashboard",
    response_model=AdminDashboardDTO,
    status_code=status.HTTP_200_OK,
    summary="Get overall platform admin dashboard statistics (Admin only)",
)
async def get_admin_dashboard(
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    user_repo: IUserRepository = Depends(get_user_repository),
    script_repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> AdminDashboardDTO:
    use_case = GetAdminDashboardUseCase(
        user_repo=user_repo,
        script_repo=script_repo,
        eval_repo=eval_repo,
    )
    return await use_case.execute()


@router.get(
    "/users",
    response_model=List[UserResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List users with optional role filtering (Admin only)",
)
async def list_users_admin(
    role: Optional[UserRole] = None,
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    user_repo: IUserRepository = Depends(get_user_repository),
) -> List[UserResponseDTO]:
    users = await user_repo.list_all(skip=skip, limit=limit)
    if role:
        users = [u for u in users if u.role == role]
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


@router.patch(
    "/users/{user_id}/status",
    response_model=UserResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Activate or deactivate user account status (Admin only)",
)
async def update_user_status(
    user_id: str,
    dto: UserStatusUpdateDTO,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    user_repo: IUserRepository = Depends(get_user_repository),
) -> UserResponseDTO:
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found.",
        )
    user.is_active = dto.is_active
    saved_user = await user_repo.create(user)
    return UserResponseDTO(
        id=saved_user.id,
        email=saved_user.email,
        full_name=saved_user.full_name,
        role=saved_user.role,
        is_active=saved_user.is_active,
        created_at=saved_user.created_at,
    )
