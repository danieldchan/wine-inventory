# domain/stock.py

from sqlmodel import Session, select, SQLModel
from uuid import UUID
from fastapi import HTTPException
from models.stock import Stock

class StockCreate(SQLModel):
    sku_id: UUID
    lot_id: UUID | None = None
    location_id: UUID
    quantity: int

def create_stock(db: Session, stock: StockCreate) -> Stock:
    db_stock = Stock(**stock.model_dump())
    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)
    return db_stock

def get_stock(db: Session, stock_id: UUID) -> Stock:
    stock = db.exec(select(Stock).where(Stock.id == stock_id)).first()
    if stock is None:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock