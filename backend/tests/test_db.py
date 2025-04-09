# tests/test_db.py

import sys
from sqlmodel import Session, select
from core.database import engine, get_db
from models.wine_sku import WineSKU, WineSKUCreate
from uuid import UUID

def test_database_connection():
    print("Testing database connection...")

    # Test 1: Check if the engine can connect
    try:
        with engine.connect() as connection:
            print("✅ Successfully connected to the database!")
    except Exception as e:
        print(f"❌ Failed to connect to the database: {e}")
        sys.exit(1)

    # Test 2: Create a sample WineSKU record
    sample_wine = WineSKUCreate(
        product_code="TEST123",
        wine_name="Test Wine",
        vintage_year=2020,
        producer="Test Producer",
        country="France",
        region="Bordeaux",
        grape_varieties=["Merlot"],
        alcohol_content=13.5,
        price_bottle=20.0,
        price_glass=5.0,
        cost_price=15.0
    )

    try:
        db = next(get_db())
        wine_sku = WineSKU(**sample_wine.model_dump())  # Updated from dict()
        db.add(wine_sku)
        db.commit()
        db.refresh(wine_sku)
        print(f"✅ Successfully created WineSKU with ID: {wine_sku.id}")
    except Exception as e:
        print(f"❌ Failed to create WineSKU: {e}")
        db.rollback()
        sys.exit(1)

    # Test 3: Query the record
    try:
        queried_wine = db.exec(select(WineSKU).where(WineSKU.id == wine_sku.id)).first()
        if queried_wine:
            print(f"✅ Successfully queried WineSKU: {queried_wine.wine_name} (ID: {queried_wine.id})")
        else:
            print("❌ Queried WineSKU not found!")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to query WineSKU: {e}")
        sys.exit(1)

    # Cleanup: Optionally remove the test record
    try:
        db.delete(queried_wine)
        db.commit()
        print("✅ Cleaned up test record.")
    except Exception as e:
        print(f"⚠️ Failed to clean up test record: {e}")

    print("All tests completed successfully!")

if __name__ == "__main__":
    import models
    test_database_connection()