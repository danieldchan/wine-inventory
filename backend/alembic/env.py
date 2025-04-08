from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv
import os

from app.database import DATABASE_URL

from models.user import Base as UserBase
from models.wine import Base as WineBase
from models.stock import Base as StockBase

# Load our environment variables
load_dotenv()

# This is the Alembic Config object
config = context.config

# Set the database URL
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Add your model's MetaData object here
target_metadata = Base.metadata

# ... rest of the existing env.py code ...