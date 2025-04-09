# routes/storage_lot.py

from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from core.database import get_db
from models.storage_lot import StorageLot
from domain.storage_lot import StorageLotCreate, create_storage_lot, get_storage_lot

router = APIRouter(prefix="/storagelots", tags=["StorageLot"])

@router.post("/", response_model=StorageLot)
def create_storage_lot_endpoint(storage_lot: StorageLotCreate, db: Session = Depends(get_db)):
    return create_storage_lot(db, storage_lot)

@router.get("/{storage_lot_id}", response_model=StorageLot)
def get_storage_lot_endpoint(storage_lot_id: UUID, db: Session = Depends(get_db)):
    return get_storage_lot(db, storage_lot_id)