# domain/location.py

from sqlmodel import Session, select
from uuid import UUID
from fastapi import HTTPException
from models.location import Location, LocationType
from sqlalchemy.orm import Session
from core.database import get_db
from sqlmodel import SQLModel

class LocationCreate(SQLModel):
    name: str
    address: str | None = None
    type: LocationType

def create_location(db: Session, location: LocationCreate) -> Location:
    db_location = Location(**location.model_dump())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def get_location(db: Session, location_id: UUID) -> Location:
    location = db.exec(select(Location).where(Location.id == location_id)).first()
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location