# models/movement.py

from sqlmodel import SQLModel, Field, Column, Enum
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
import enum

class MovementType(str, enum.Enum):
    INBOUND = "Inbound"
    OUTBOUND = "Outbound"
    TRANSFER = "Transfer"
    DEPLETION = "Depletion"
    ADJUSTMENT = "Adjustment"

class Movement(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    batch_ref: str = Field(index=True)  # Index for tracking
    sku_id: UUID = Field(foreign_key="wineskus.id")
    quantity: int = Field(gt=0)  # Ensure quantity > 0
    from_location_id: Optional[UUID] = Field(default=None, foreign_key="locations.id")
    to_location_id: Optional[UUID] = Field(default=None, foreign_key="locations.id")
    from_lot_id: Optional[UUID] = Field(default=None, foreign_key="storagelots.id")
    to_lot_id: Optional[UUID] = Field(default=None, foreign_key="storagelots.id")
    movement_type: MovementType = Field(sa_column=Column(Enum(MovementType), nullable=False))
    reason: Optional[str] = Field(default=None)
    performed_by: UUID = Field(foreign_key="users.id")
    approved_by: Optional[UUID] = Field(default=None, foreign_key="users.id")
    is_high_value: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "movements"