# domain/storage_lot.py

from sqlmodel import Session, select, SQLModel
from uuid import UUID
from fastapi import HTTPException
from models.storage_lot import StorageLot

class StorageLotCreate(SQLModel):
    location_id: UUID
    lot_name: str
    capacity: int

def create_storage_lot(db: Session, storage_lot: StorageLotCreate) -> StorageLot:
    db_storage_lot = StorageLot(**storage_lot.model_dump())
    db.add(db_storage_lot)
    db.commit()
    db.refresh(db_storage_lot)
    return db_storage_lot

def get_storage_lot(db: Session, storage_lot_id: UUID) -> StorageLot:
    storage_lot = db.exec(select(StorageLot).where(StorageLot.id == storage_lot_id)).first()
    if storage_lot is None:
        raise HTTPException(status_code=404, detail="Storage lot not found")
    return storage_lot