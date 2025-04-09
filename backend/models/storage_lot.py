# models/storage_lot.py

from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint  # Add this import
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime

class StorageLot(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    location_id: UUID = Field(foreign_key="locations.id")
    lot_name: str = Field(index=True)
    capacity: int = Field(gt=0)  # Ensure capacity > 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "storagelots"
    __table_args__ = (UniqueConstraint("location_id", "lot_name", name="unique_storage_lot"),)