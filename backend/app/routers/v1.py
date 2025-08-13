from __future__ import annotations

from typing import List, Optional

import sentry_sdk
from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import lifespan_session
from ..models import InventoryMovement, Product
from ..schemas import CheckoutIn, CheckoutOut, ProductOut
from ..services.external import payment_charge, shipping_quote, tax_compute
from ..services.inventory import get_inventory_for_product_naive
from ..services.pricing import apply_coupon_naive

router = APIRouter(prefix="/api/v1")


async def get_session() -> AsyncSession:
    async with lifespan_session() as s:
        yield s


@router.get("/products", response_model=List[ProductOut])
async def list_products(
    category: Optional[str] = Query(default=None),
    limit: int = 20,
    offset: int = 0,
    x_scenario: Optional[str] = Header(default=None, alias="X-Scenario"),
    session: AsyncSession = Depends(get_session),
):
    q = select(Product)
    if category:
        # still naive: filter products by slug pattern on product slug
        q = q.where(Product.slug.like(f"{category}-%"))
    with sentry_sdk.start_span(op="db.query", description="SELECT products") as span:
        span.set_data("db.system", "sqlite")
        products = (await session.execute(q.offset(offset).limit(limit))).scalars().all()

    result: List[ProductOut] = []
    for p in products:
        with sentry_sdk.start_span(op="db.inventory", description=f"inventory product {p.id}"):
            inv = await get_inventory_for_product_naive(session, p.id)
        result.append(ProductOut.model_validate({**p.__dict__, "inventory": inv}))
    return result


@router.post("/checkout", response_model=CheckoutOut)
async def checkout(
    payload: CheckoutIn,
    x_scenario: Optional[str] = Header(default=None, alias="X-Scenario"),
    session: AsyncSession = Depends(get_session),
):
    # naive sequential work
    subtotal = 0
    for item in payload.items:
        with sentry_sdk.start_span(op="db.query", description=f"SELECT product {item.product_id}") as span:
            span.set_data("db.system", "sqlite")
            prod = (await session.execute(select(Product).where(Product.id == item.product_id))).scalars().first()
        if not prod:
            continue
        inv = await get_inventory_for_product_naive(session, prod.id)
        if inv < item.quantity:
            raise ValueError("Out of stock")
        subtotal += prod.price_cents * item.quantity

    discount = await apply_coupon_naive(session, subtotal, payload.coupon_code)
    shipping = await shipping_quote(payload.address or "", subtotal, x_scenario)
    tax = await tax_compute(payload.address or "", subtotal)

    total = subtotal - discount + shipping + tax

    ok, auth_id = await payment_charge(payload.payment_token or "tok_demo", total, x_scenario)

    # simulate slow email
    with sentry_sdk.start_span(op="email.send", description="send confirmation"):
        import asyncio

        await asyncio.sleep(0.2)

    trace_id = sentry_sdk.get_current_scope().transaction and sentry_sdk.get_current_scope().transaction.trace_id

    return CheckoutOut(order_id=1, total_cents=total, status="confirmed", trace_id=trace_id)
