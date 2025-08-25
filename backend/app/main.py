from __future__ import annotations

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routers import v1, v2


def init_sentry():
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return
    
    enable_logs = os.getenv("ENABLE_SENTRY_LOGS", "false").lower() == "true"
    
    sentry_sdk.init(
        dsn=dsn,
        debug=True,
        # Add data like request headers and IP for users, if applicable;
        # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
        send_default_pii=True,
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for tracing.
        traces_sample_rate=1.0,
        # To collect profiles for all profile sessions,
        # set `profile_session_sample_rate` to 1.0.
        profile_session_sample_rate=1.0,
        # Profiles will be automatically collected while
        # there is an active span.
        profile_lifecycle="trace",
        # Enable logs to be sent to Sentry
        _experiments={
            "enable_logs": enable_logs,
        },
        integrations=[
            FastApiIntegration(transaction_style="endpoint"),
            SqlalchemyIntegration(),
        ],
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


init_sentry()
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(v1.router)
app.include_router(v2.router)


@app.get("/")
async def root(request: Request):
    return {"ok": True}


@app.post("/seed-database")
async def seed_database():
    """One-time database seeding endpoint."""
    from sqlalchemy import select
    from .models import Product, Category, User, Coupon, InventoryMovement
    from .db import SessionLocal
    import random
    from datetime import datetime, timedelta
    
    async with SessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(Product).limit(1))
        if result.scalar() is not None:
            return {"status": "already_seeded", "message": "Database already has products"}
        
        # Seed user
        user = User(email="demo@skipline.app")
        session.add(user)
        
        # Seed categories
        categories = [
            Category(name="Gadgets", slug="gadgets"),
            Category(name="Home", slug="home"),
            Category(name="Outdoors", slug="outdoors"),
            Category(name="Style", slug="style"),
        ]
        session.add_all(categories)
        await session.flush()
        
        # Seed products
        products_data = [
            ("Wireless Earbuds", "wireless-earbuds", 0, 14999),
            ("Smart Watch", "smart-watch", 0, 29999),
            ("Portable Charger", "portable-charger", 0, 3999),
            ("Bluetooth Speaker", "bluetooth-speaker", 1, 7999),
            ("Coffee Maker", "coffee-maker", 1, 12999),
            ("Robot Vacuum", "robot-vacuum", 1, 49999),
            ("Camping Tent", "camping-tent", 2, 19999),
            ("Hiking Backpack", "hiking-backpack", 2, 8999),
            ("Water Bottle", "water-bottle", 2, 2499),
            ("Running Shoes", "running-shoes", 3, 11999),
            ("Winter Jacket", "winter-jacket", 3, 15999),
            ("Sunglasses", "sunglasses", 3, 9999),
        ]
        
        products = []
        for name, slug, cat_idx, price in products_data:
            product = Product(
                name=name,
                slug=slug,
                category_id=categories[cat_idx].id,
                price_cents=price,
                image_url=f"https://picsum.photos/seed/{slug}/400/300"
            )
            products.append(product)
        session.add_all(products)
        await session.flush()
        
        # Add inventory
        for product in products:
            movement = InventoryMovement(
                product_id=product.id,
                delta=random.randint(5, 50)
            )
            session.add(movement)
        
        # Add coupons
        coupons = [
            Coupon(
                code="SAVE10",
                percent_off=10,
                starts_at=datetime.now() - timedelta(days=30),
                ends_at=datetime.now() + timedelta(days=30),
                min_subtotal_cents=5000,
            ),
            Coupon(
                code="BLACKFRIDAY",
                percent_off=50,
                starts_at=datetime.now() - timedelta(days=1),
                ends_at=datetime.now() + timedelta(days=1),
                min_subtotal_cents=0,
                applies_to_category_id=categories[0].id,
            ),
        ]
        session.add_all(coupons)
        
        await session.commit()
        
        return {
            "status": "success",
            "message": "Database seeded successfully!",
            "data": {
                "categories": len(categories),
                "products": len(products),
                "coupons": ["SAVE10", "BLACKFRIDAY"]
            }
        }
