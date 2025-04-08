# main.py

from fastapi import FastAPI, HTTPException
from uuid import UUID
from models.wine_sku import WineSKU, WineSKUCreate

app = FastAPI(
    title="Wine Inventory API",
    description="API for managing wine stock",
    version="0.1.0"
)

wine_db: dict[UUID, WineSKU] = {}

@app.post("/wines/", response_model=WineSKU)
async def create_wine(wine: WineSKUCreate):
    wine_sku = WineSKU(**wine.dict())
    wine_db[wine_sku.id] = wine_sku
    return wine_sku

@app.get("/wines/{wine_id}", response_model=WineSKU)
async def get_wine(wine_id: UUID):
    wine = wine_db.get(wine_id)
    if wine is None:
        raise HTTPException(status_code=404, detail="Wine not found")
    return wine