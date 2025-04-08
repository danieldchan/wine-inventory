# models/stock.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID, uuid4

class StockBase(BaseModel):
    sku_id: UUID
    lot_id: Optional[UUID] = None
    location_id: UUID
    quantity: int

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: UUID = uuid4()
    updated_at: str

    class Config:
        from_attributes = True