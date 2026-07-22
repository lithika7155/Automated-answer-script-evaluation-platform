from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.domain.models.user import UserRole


class UserRegisterDTO(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: UserRole = UserRole.STUDENT


class UserLoginDTO(BaseModel):
    email: EmailStr
    password: str


class TokenDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponseDTO(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
