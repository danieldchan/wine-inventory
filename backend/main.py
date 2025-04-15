# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.wine_sku import router as wine_sku_router
from routes.user import router as user_router
from routes.location import router as location_router
from routes.movement import router as movement_router
from routes.storage_lot import router as storage_lot_router
from routes.stock import router as stock_router

app = FastAPI(
    title="Wine Inventory API",
    description="API for managing wine stock",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount the routers
app.include_router(wine_sku_router)
app.include_router(user_router)
app.include_router(location_router)
app.include_router(movement_router)
app.include_router(storage_lot_router)
app.include_router(stock_router)