# models/location.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

class LocationType(str, Enum):
    CELLAR = "Cellar"
    OUTLET = "Outlet"
    WAREHOUSE = "Warehouse"

class LocationBase(BaseModel):
    name: str
    address: Optional[str] = None
    type: LocationType

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: UUID = uuid4()
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True