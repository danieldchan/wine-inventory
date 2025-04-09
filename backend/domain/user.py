# domain/user.py

from sqlmodel import Session, select
from uuid import UUID
from fastapi import HTTPException
from models.user import User, UserRole
from sqlalchemy.orm import Session
from core.database import get_db
import bcrypt
from sqlmodel import SQLModel

class UserCreate(SQLModel):
    first_name: str
    last_name: str
    email: str
    contact: str | None = None
    role: UserRole
    hashed_password: str

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: UUID) -> User:
    user = db.exec(select(User).where(User.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user