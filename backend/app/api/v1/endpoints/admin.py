from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_user_repository, require_roles
from app.application.dtos.admin import AdminDashboardDTO, UserStatusUpdateDTO
from app.application.dtos.answer_script import AnswerScriptResponseDTO
from app.application.dtos.evaluation import EvaluationResultResponseDTO
from app.application.dtos.user import UserResponseDTO
from app.application.use_cases.get_admin_dashboard import GetAdminDashboardUseCase
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.interfaces.file_storage import IFileStorage
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User, UserRole
from app.infrastructure.database.mongodb import get_mongo_db
from app.infrastructure.repositories.mongo_answer_script_repository import (
    MongoAnswerScriptRepository,
)
from app.infrastructure.repositories.mongo_evaluation_repository import (
    MongoEvaluationRepository,
)
from app.infrastructure.storage.local_file_storage import LocalFileStorage

router = APIRouter()


def get_answer_script_repository() -> IAnswerScriptRepository:
    db = get_mongo_db()
    return MongoAnswerScriptRepository(db=db)


def get_evaluation_repository() -> IEvaluationRepository:
    db = get_mongo_db()
    return MongoEvaluationRepository(db=db)


def get_file_storage() -> IFileStorage:
    return LocalFileStorage()


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get(
    "/dashboard",
    response_model=AdminDashboardDTO,
    status_code=status.HTTP_200_OK,
    summary="Overall platform statistics (Admin only)",
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


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get(
    "/users",
    response_model=List[UserResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List all users with optional role filter (Admin only)",
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
    summary="Activate or deactivate a user account (Admin only)",
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


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Permanently delete a user account (Admin only)",
)
async def delete_user(
    user_id: str,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    user_repo: IUserRepository = Depends(get_user_repository),
):
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found.",
        )
    await user_repo.delete(user_id)
    return {"detail": "User deleted successfully", "id": user_id}


# ── Scripts ────────────────────────────────────────────────────────────────────

@router.get(
    "/scripts",
    response_model=List[AnswerScriptResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List all uploaded answer scripts (Admin only)",
)
async def list_all_scripts(
    skip: int = 0,
    limit: int = 200,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
) -> List[AnswerScriptResponseDTO]:
    return await repo.list_all(skip=skip, limit=limit)


@router.delete(
    "/scripts/{script_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an answer script record and file (Admin only)",
)
async def admin_delete_script(
    script_id: str,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
    storage: IFileStorage = Depends(get_file_storage),
):
    from app.application.use_cases.delete_answer_script import DeleteAnswerScriptUseCase
    from app.domain.exceptions.answer_script import AnswerScriptNotFoundException
    use_case = DeleteAnswerScriptUseCase(repository=repo, storage=storage)
    try:
        await use_case.execute(script_id)
        return {"detail": "Script deleted successfully", "id": script_id}
    except AnswerScriptNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ── Evaluations ────────────────────────────────────────────────────────────────

@router.get(
    "/evaluations",
    response_model=List[EvaluationResultResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List all evaluation results (Admin only)",
)
async def list_all_evaluations(
    skip: int = 0,
    limit: int = 200,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> List[EvaluationResultResponseDTO]:
    from app.application.use_cases.list_evaluations import ListEvaluationsUseCase
    use_case = ListEvaluationsUseCase(eval_repository=eval_repo)
    return await use_case.execute(skip=skip, limit=limit)


@router.delete(
    "/evaluations/{evaluation_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an evaluation record (Admin only)",
)
async def admin_delete_evaluation(
    evaluation_id: str,
    current_admin: User = Depends(require_roles([UserRole.ADMIN])),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
):
    result = await eval_repo.get_by_id(evaluation_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation '{evaluation_id}' not found.",
        )
    await eval_repo.delete(evaluation_id)
    return {"detail": "Evaluation deleted successfully", "id": evaluation_id}
