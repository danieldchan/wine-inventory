# domain/movement.py

from sqlmodel import Session, select, SQLModel
from uuid import UUID
from fastapi import HTTPException
from models.movement import Movement, MovementType

class MovementCreate(SQLModel):
    batch_ref: str
    sku_id: UUID
    quantity: int
    from_location_id: UUID | None = None
    to_location_id: UUID | None = None
    from_lot_id: UUID | None = None
    to_lot_id: UUID | None = None
    movement_type: MovementType
    reason: str | None = None
    performed_by: UUID
    approved_by: UUID | None = None
    is_high_value: bool = False

def create_movement(db: Session, movement: MovementCreate) -> Movement:
    db_movement = Movement(**movement.model_dump())
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def get_movement(db: Session, movement_id: UUID) -> Movement:
    movement = db.exec(select(Movement).where(Movement.id == movement_id)).first()
    if movement is None:
        raise HTTPException(status_code=404, detail="Movement not found")
    return movement