# routes/user.py

from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from core.database import get_db
from models.user import User
from domain.user import UserCreate, create_user, get_user

router = APIRouter(prefix="/users", tags=["User"])

@router.post("/", response_model=User)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.get("/{user_id}", response_model=User)
def get_user_endpoint(user_id: UUID, db: Session = Depends(get_db)):
    return get_user(db, user_id)