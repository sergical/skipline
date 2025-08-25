#!/usr/bin/env python3
"""
One-time seed script that checks if data already exists before seeding.
Safe to run multiple times.
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db import SessionLocal
from app.models import Product, Category


async def check_if_seeded():
    """Check if database already has data."""
    async with SessionLocal() as session:
        # Check if we have any products
        result = await session.execute(select(Product).limit(1))
        return result.scalar() is not None


async def main():
    """Run seed only if database is empty."""
    if await check_if_seeded():
        print("✅ Database already seeded. Skipping...")
        return
    
    print("🌱 Seeding database...")
    from seed import seed
    await seed()
    print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(main())
