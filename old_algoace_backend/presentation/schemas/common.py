from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, Field

T = TypeVar("T")

class ErrorResponse(BaseModel):
    detail: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    has_next: bool
