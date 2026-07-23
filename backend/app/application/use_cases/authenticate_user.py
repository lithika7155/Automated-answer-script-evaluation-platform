from app.application.dtos.user import UserLoginDTO, TokenDTO
from app.domain.exceptions.user import InvalidCredentialsException
from app.domain.interfaces.user_repository import IUserRepository
from app.infrastructure.security.jwt import JWTHandler
from app.infrastructure.security.password import PasswordHasher


class AuthenticateUserUseCase:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def execute(self, dto: UserLoginDTO) -> TokenDTO:
        normalized_email = dto.email.lower().strip()
        user = await self.user_repo.get_by_email(normalized_email)
        if not user:
            raise InvalidCredentialsException()

        if not PasswordHasher.verify_password(dto.password, user.hashed_password):
            raise InvalidCredentialsException()

        access_token = JWTHandler.create_access_token(
            subject=user.id,
            role=user.role.value,
        )
        return TokenDTO(access_token=access_token, token_type="bearer")
