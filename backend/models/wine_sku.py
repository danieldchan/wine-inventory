# models/wine_sku.py

from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID, uuid4

class WineSKUBase(BaseModel):
    product_code: str
    barcode: Optional[str] = None
    wine_name: str
    description: Optional[str] = None
    vintage_year: int
    producer: str
    country: str
    region: str
    appellation: Optional[str] = None
    grape_varieties: List[str]
    alcohol_content: float
    bottling_date: Optional[str] = None  # Use str for now; switch to date later
    price_bottle: float
    price_glass: float
    cost_price: float
    condition_notes: Optional[List[str]] = None

class WineSKUCreate(WineSKUBase):
    pass

class WineSKU(WineSKUBase):
    id: UUID = uuid4()
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True