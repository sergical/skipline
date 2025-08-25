from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .db_config import get_database_url

DATABASE_URL = get_database_url()
print(f"Using database URL: {DATABASE_URL}")

engine = create_async_engine(
    DATABASE_URL, 
    future=True, 
    echo=False,
    # Enable SQLAlchemy integration to work with async
    pool_pre_ping=True,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


@asynccontextmanager
async def lifespan_session() -> AsyncIterator[AsyncSession]:
    session = SessionLocal()
    try:
        yield session
    finally:
        await session.close()
