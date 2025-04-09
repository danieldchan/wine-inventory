# domain/wine_sku.py

from sqlmodel import Session, select
from uuid import UUID
from fastapi import HTTPException
from models.wine_sku import WineSKU, WineSKUCreate

def create_wine(db: Session, wine: WineSKUCreate) -> WineSKU:
    wine_sku = WineSKU(**wine.model_dump())
    db.add(wine_sku)
    db.commit()
    db.refresh(wine_sku)
    return wine_sku

def get_wine(db: Session, wine_id: UUID) -> WineSKU:
    wine = db.exec(select(WineSKU).where(WineSKU.id == wine_id)).first()
    if wine is None:
        raise HTTPException(status_code=404, detail="Wine not found")
    return wine