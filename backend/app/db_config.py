import os
from typing import Optional

def get_database_url() -> str:
    """
    Get database URL from environment or use SQLite as fallback.
    Supports both PostgreSQL (production) and SQLite (development).
    """
    # Check for production PostgreSQL URL
    database_url = os.getenv("DATABASE_URL")
    
    if database_url:
        # Handle Render/Railway PostgreSQL URLs
        if database_url.startswith("postgres://"):
            # Convert to asyncpg format for SQLAlchemy
            database_url = database_url.replace("postgres://", "postgresql+asyncpg://")
        return database_url
    
    # Default to SQLite for local development
    return "sqlite+aiosqlite:///./skipline.db"

def is_sqlite() -> bool:
    """Check if we're using SQLite."""
    return "sqlite" in get_database_url()
