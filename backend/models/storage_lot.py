# models/storage_lot.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4

class StorageLotBase(BaseModel):
    location_id: UUID
    lot_name: str
    capacity: int

class StorageLotCreate(StorageLotBase):
    pass

class StorageLot(StorageLotBase):
    id: UUID = uuid4()
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True