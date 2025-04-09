# models/location.py

from sqlmodel import SQLModel, Field, Column, Enum
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
import enum

class LocationType(str, enum.Enum):
    CELLAR = "Cellar"
    OUTLET = "Outlet"
    WAREHOUSE = "Warehouse"

class Location(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)  # Index for faster lookups
    address: Optional[str] = Field(default=None)
    type: LocationType = Field(sa_column=Column(Enum(LocationType), nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "locations"