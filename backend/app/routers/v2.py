from __future__ import annotations

from typing import List, Optional

import sentry_sdk
from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import lifespan_session
from ..models import Product
from ..schemas import CheckoutIn, CheckoutOut, ProductOut
from ..services.external import payment_charge, shipping_quote, tax_compute
from ..services.inventory import get_inventory_for_products_aggregated
from ..services.pricing import apply_coupon_fast

router = APIRouter(prefix="/api/v2")


async def get_session() -> AsyncSession:
    async with lifespan_session() as s:
        yield s


@router.get("/catalog", response_model=List[ProductOut])
async def catalog(
    category: Optional[str] = Query(default=None),
    include: Optional[str] = Query(default=None),
    limit: int = 20,
    offset: int = 0,
    x_scenario: Optional[str] = Header(default=None, alias="X-Scenario"),
    session: AsyncSession = Depends(get_session),
):
    q = select(Product)
    if category:
        q = q.where(Product.slug.like(f"{category}-%"))
    with sentry_sdk.start_span(op="db.query", description="SELECT products") as span:
        span.set_data("db.system", "sqlite")
        products = (await session.execute(q.offset(offset).limit(limit))).scalars().all()
    ids = [p.id for p in products]
    inventory_map = await get_inventory_for_products_aggregated(session, ids)
    result: List[ProductOut] = []
    for p in products:
        inv = inventory_map.get(p.id, 0) if (include and "inventory" in include) else None
        result.append(ProductOut.model_validate({**p.__dict__, "inventory": inv}))
    return result


@router.post("/checkout", response_model=CheckoutOut)
async def checkout(
    payload: CheckoutIn,
    x_scenario: Optional[str] = Header(default=None, alias="X-Scenario"),
    session: AsyncSession = Depends(get_session),
):
    # parallelize IO
    subtotal = 0
    product_ids = [i.product_id for i in payload.items]
    with sentry_sdk.start_span(op="db.query", description="SELECT products by IDs") as span:
        span.set_data("db.system", "sqlite")
        products = (await session.execute(select(Product).where(Product.id.in_(product_ids)))).scalars().all()
    prod_map = {p.id: p for p in products}

    # reserve inventory quickly (simulated)
    inventory_map = await get_inventory_for_products_aggregated(session, product_ids)
    for item in payload.items:
        if inventory_map.get(item.product_id, 0) < item.quantity:
            raise ValueError("Out of stock")
        subtotal += prod_map[item.product_id].price_cents * item.quantity

    discount_task = apply_coupon_fast(session, subtotal, payload.coupon_code)
    shipping_task = shipping_quote(payload.address or "", subtotal, x_scenario)
    tax_task = tax_compute(payload.address or "", subtotal)

    import asyncio

    discount, shipping, tax = await asyncio.gather(discount_task, shipping_task, tax_task)

    total = subtotal - discount + shipping + tax

    ok, auth_id = await payment_charge(payload.payment_token or "tok_demo", total, x_scenario)

    # email offloaded (simulated quick enqueue)
    with sentry_sdk.start_span(op="email.enqueue", description="enqueue confirmation"):
        pass

    trace_id = sentry_sdk.get_current_scope().transaction and sentry_sdk.get_current_scope().transaction.trace_id

    return CheckoutOut(order_id=1, total_cents=total, status="confirmed", trace_id=trace_id)
