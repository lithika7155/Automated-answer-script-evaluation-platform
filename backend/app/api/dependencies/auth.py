from typing import Callable, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User, UserRole
from app.infrastructure.database.mongodb import get_mongo_db
from app.infrastructure.repositories.mongo_user_repository import MongoUserRepository
from app.infrastructure.security.jwt import JWTHandler

security = HTTPBearer()


def get_user_repository() -> IUserRepository:
    db = get_mongo_db()
    return MongoUserRepository(db=db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_repo: IUserRepository = Depends(get_user_repository),
) -> User:
    token = credentials.credentials
    try:
        payload = JWTHandler.decode_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found",
        )
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )
    return current_user


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role.value}' does not have sufficient permissions.",
            )
        return current_user

    return role_checker
