# models/wine_sku.py

from sqlmodel import SQLModel, Field, Column, JSON
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime

class WineSKUCreate(SQLModel):
    product_code: str = Field(unique=True, index=True)
    barcode: Optional[str] = Field(default=None)
    wine_name: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    vintage_year: int = Field(ge=1900, le=datetime.utcnow().year)
    producer: str
    country: str
    region: str
    appellation: Optional[str] = Field(default=None)
    grape_varieties: List[str]
    alcohol_content: float = Field(ge=0.0)
    bottling_date: Optional[datetime] = Field(default=None)
    price_bottle: float = Field(ge=0.0)
    price_glass: float = Field(ge=0.0)
    cost_price: float = Field(ge=0.0)
    condition_notes: Optional[List[str]] = Field(default=None)

class WineSKU(WineSKUCreate, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "wineskus"
    grape_varieties: List[str] = Field(sa_column=Column(JSON))  # Override to specify JSON column
    condition_notes: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))  # Override to specify JSON column