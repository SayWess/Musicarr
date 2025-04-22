from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session
