# models/stock.py

from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint  # Add this import
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime

class Stock(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    sku_id: UUID = Field(foreign_key="wineskus.id")
    lot_id: Optional[UUID] = Field(default=None, foreign_key="storagelots.id")
    location_id: UUID = Field(foreign_key="locations.id")
    quantity: int = Field(gt=0)  # Ensure quantity > 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "stocks"
    __table_args__ = (UniqueConstraint("sku_id", "lot_id", "location_id", name="unique_stock"),)