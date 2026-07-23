from app.application.dtos.user import UserRegisterDTO, UserResponseDTO
from app.domain.exceptions.user import UserAlreadyExistsException
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User
from app.infrastructure.security.password import PasswordHasher


class RegisterUserUseCase:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def execute(self, dto: UserRegisterDTO) -> UserResponseDTO:
        normalized_email = dto.email.lower().strip()
        existing_user = await self.user_repo.get_by_email(normalized_email)
        if existing_user:
            raise UserAlreadyExistsException(normalized_email)

        hashed_password = PasswordHasher.hash_password(dto.password)
        new_user = User(
            email=normalized_email,
            hashed_password=hashed_password,
            full_name=dto.full_name,
            role=dto.role,
        )

        saved_user = await self.user_repo.create(new_user)
        return UserResponseDTO(
            id=saved_user.id,
            email=saved_user.email,
            full_name=saved_user.full_name,
            role=saved_user.role,
            is_active=saved_user.is_active,
            created_at=saved_user.created_at,
        )
