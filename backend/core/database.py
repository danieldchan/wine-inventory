# core/database.py

from sqlmodel import create_engine, Session, SQLModel
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Define DATABASE_URL with a fallback
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a session factory
SessionLocal = Session(engine)

# Dependency for FastAPI or other frameworks
def get_db():
    db = SessionLocal
    try:
        yield db
    finally:
        db.close()

# Optional: Create all tables (uncomment to run once or handle via Alembic)
# SQLModel.metadata.create_all(engine)