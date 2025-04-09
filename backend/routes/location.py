# routes/location.py

from fastapi import APIRouter, Depends
from sqlmodel import Session
from uuid import UUID
from core.database import get_db
from models.location import Location
from domain.location import LocationCreate, create_location, get_location

router = APIRouter(prefix="/locations", tags=["Location"])

@router.post("/", response_model=Location)
def create_location_endpoint(location: LocationCreate, db: Session = Depends(get_db)):
    return create_location(db, location)

@router.get("/{location_id}", response_model=Location)
def get_location_endpoint(location_id: UUID, db: Session = Depends(get_db)):
    return get_location(db, location_id)