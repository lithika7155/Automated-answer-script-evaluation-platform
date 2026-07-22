from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class UserRole(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    hashed_password: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
