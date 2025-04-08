# models/user.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    STAFF = "Staff"

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    contact: Optional[str] = None
    role: UserRole

class UserCreate(UserBase):
    password: str  # Plain password for creation; hash it in the app logic

class User(UserBase):
    id: UUID = uuid4()
    name: str  # Computed in app logic as first_name + last_name
    is_active: bool = True
    created_at: str  # Using str for simplicity; use datetime later
    updated_at: str

    class Config:
        from_attributes = True