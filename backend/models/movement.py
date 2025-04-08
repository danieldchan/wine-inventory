# models/movement.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

class MovementType(str, Enum):
    INBOUND = "Inbound"
    OUTBOUND = "Outbound"
    TRANSFER = "Transfer"
    DEPLETION = "Depletion"
    ADJUSTMENT = "Adjustment"

class MovementBase(BaseModel):
    batch_ref: str
    sku_id: UUID
    quantity: int
    from_location_id: Optional[UUID] = None
    to_location_id: Optional[UUID] = None
    from_lot_id: Optional[UUID] = None
    to_lot_id: Optional[UUID] = None
    movement_type: MovementType
    reason: Optional[str] = None
    performed_by: UUID
    approved_by: Optional[UUID] = None
    is_high_value: bool = False

class MovementCreate(MovementBase):
    pass

class Movement(MovementBase):
    id: UUID = uuid4()
    created_at: str

    class Config:
        from_attributes = True