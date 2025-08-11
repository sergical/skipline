from __future__ import annotations

import asyncio
import random
from datetime import datetime, timedelta

from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import SessionLocal, engine
from app.db import Base
from app.models import Category, Coupon, InventoryMovement, Product, User


CATEGORIES = [
    ("Gadgets", "gadgets"),
    ("Home", "home"),
    ("Outdoors", "outdoors"),
    ("Style", "style"),
]


async def seed():
    # Ensure tables exist when running seed directly (no server lifespan)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:  # type: AsyncSession
        await session.execute(insert(User).values({"email": "demo@skipline.app"}))

        category_ids = []
        for name, slug in CATEGORIES:
            res = await session.execute(insert(Category).values({"name": name, "slug": slug}).returning(Category.id))
            category_ids.append(res.scalar_one())

        products = []
        for i in range(1, 501):
            cat_id = random.choice(category_ids)
            products.append(
                {
                    "name": f"Product {i}",
                    "slug": f"product-{i}",
                    "category_id": cat_id,
                    "price_cents": random.choice([1999, 2999, 4999, 9999]),
                    "image_url": "https://picsum.photos/seed/" + str(i) + "/400/400",
                }
            )
        res = await session.execute(insert(Product).returning(Product.id), products)
        product_ids = [r for r in res.scalars().all()]

        # inventory movements
        start = datetime.utcnow() - timedelta(days=120)
        movements = []
        for pid in product_ids:
            stock = random.randint(0, 50)
            movements.append({"product_id": pid, "delta": stock, "created_at": start})
            for d in range(1, 90):
                # simulate some purchases and restocks
                movements.append({"product_id": pid, "delta": random.choice([-1, 0, 0, 1]), "created_at": start + timedelta(days=d)})
        # chunk inserts
        for i in range(0, len(movements), 5000):
            await session.execute(insert(InventoryMovement), movements[i : i + 5000])

        now = datetime.utcnow()
        coupons = [
            {"code": "SAVE10", "percent_off": 10, "starts_at": now - timedelta(days=1), "ends_at": now + timedelta(days=30), "min_subtotal_cents": 0},
            {"code": "STYLE15", "percent_off": 15, "starts_at": now - timedelta(days=1), "ends_at": now + timedelta(days=10), "min_subtotal_cents": 5000},
            {"code": "EXPIRED5", "percent_off": 5, "starts_at": now - timedelta(days=30), "ends_at": now - timedelta(days=1), "min_subtotal_cents": 0},
        ]
        await session.execute(insert(Coupon), coupons)

        await session.commit()
        print("Seed complete")


if __name__ == "__main__":
    asyncio.run(seed())
