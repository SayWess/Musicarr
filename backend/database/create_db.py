from sqlalchemy.ext.asyncio import create_async_engine
from database import Base
from models import Uploader, Playlist, Video, PlaylistVideo, RootFolder, GlobalPreferences
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# This script creates the database tables based on the models defined in models.py
# To use if you don't have alembic or want to create the tables manually

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Create async engine and session maker
engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Create all tables in the database
async def create_tables():
    async with engine.begin() as conn:
        # This will create all tables defined by the Base metadata
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    import asyncio
    asyncio.run(create_tables())
