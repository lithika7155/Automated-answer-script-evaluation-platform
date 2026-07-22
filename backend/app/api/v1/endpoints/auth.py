from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies.auth import get_current_active_user, get_user_repository
from app.application.dtos.user import (
    TokenDTO,
    UserLoginDTO,
    UserRegisterDTO,
    UserResponseDTO,
)
from app.application.use_cases.authenticate_user import AuthenticateUserUseCase
from app.application.use_cases.register_user import RegisterUserUseCase
from app.domain.exceptions.user import (
    InvalidCredentialsException,
    UserAlreadyExistsException,
)
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (Student, Faculty, Admin)",
)
async def register(
    dto: UserRegisterDTO,
    user_repo: IUserRepository = Depends(get_user_repository),
) -> UserResponseDTO:
    use_case = RegisterUserUseCase(user_repo)
    try:
        return await use_case.execute(dto)
    except UserAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=TokenDTO,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and receive JWT access token",
)
async def login(
    dto: UserLoginDTO,
    user_repo: IUserRepository = Depends(get_user_repository),
) -> TokenDTO:
    use_case = AuthenticateUserUseCase(user_repo)
    try:
        return await use_case.execute(dto)
    except InvalidCredentialsException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get(
    "/me",
    response_model=UserResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> UserResponseDTO:
    return UserResponseDTO(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )
