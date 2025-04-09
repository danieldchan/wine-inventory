# routes/stock.py

from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from core.database import get_db
from models.stock import Stock
from domain.stock import StockCreate, create_stock, get_stock

router = APIRouter(prefix="/stocks", tags=["Stock"])

@router.post("/", response_model=Stock)
def create_stock_endpoint(stock: StockCreate, db: Session = Depends(get_db)):
    return create_stock(db, stock)

@router.get("/{stock_id}", response_model=Stock)
def get_stock_endpoint(stock_id: UUID, db: Session = Depends(get_db)):
    return get_stock(db, stock_id)