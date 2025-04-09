# routes/movement.py

from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from core.database import get_db
from models.movement import Movement
from domain.movement import MovementCreate, create_movement, get_movement

router = APIRouter(prefix="/movements", tags=["Movement"])

@router.post("/", response_model=Movement)
def create_movement_endpoint(movement: MovementCreate, db: Session = Depends(get_db)):
    return create_movement(db, movement)

@router.get("/{movement_id}", response_model=Movement)
def get_movement_endpoint(movement_id: UUID, db: Session = Depends(get_db)):
    return get_movement(db, movement_id)