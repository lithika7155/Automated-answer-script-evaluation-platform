from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.models.user import User


class IUserRepository(ABC):
    """Abstract Port for User Persistence."""

    @abstractmethod
    async def create(self, user: User) -> User:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[User]:
        pass

    @abstractmethod
    async def list_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        pass
