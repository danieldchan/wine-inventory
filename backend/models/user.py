# models/user.py

from sqlmodel import SQLModel, Field, Column, Enum
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import EmailStr
import enum

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    STAFF = "Staff"

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    first_name: str
    last_name: str
    email: EmailStr = Field(unique=True, index=True)
    contact: Optional[str] = Field(default=None)
    role: UserRole = Field(sa_column=Column(Enum(UserRole), nullable=False))
    hashed_password: str  # Store hashed password
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "users"