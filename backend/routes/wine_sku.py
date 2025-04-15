# routes/wine_sku.py

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from uuid import UUID
from core.database import get_db
from models.wine_sku import WineSKU, WineSKUCreate
from domain.wine_sku import create_wine, get_wine

router = APIRouter(prefix="/wines", tags=["WineSKU"])

@router.post("/", response_model=WineSKU)
def create_wine_endpoint(wine: WineSKUCreate, db: Session = Depends(get_db)):
    return create_wine(db, wine)

@router.get("/{wine_id}", response_model=WineSKU)
def get_wine_endpoint(wine_id: UUID, db: Session = Depends(get_db)):
    return get_wine(db, wine_id)