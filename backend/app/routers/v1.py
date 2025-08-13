from __future__ import annotations

from typing import List, Optional

import sentry_sdk
from sentry_sdk import logger
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


@router.get("/catalog", response_model=List[ProductOut])
async def catalog(
    category: Optional[str] = Query(default=None),
    limit: int = 20,
    offset: int = 0,
    x_scenario: Optional[str] = Header(default=None, alias="X-Scenario"),
    session: AsyncSession = Depends(get_session),
):
    logger.debug(f"Listing products with category={category}, limit={limit}, offset={offset}")
    
    q = select(Product)
    if category:
        # still naive: filter products by slug pattern on product slug
        q = q.where(Product.slug.like(f"{category}-%"))
        logger.info(f"Filtering products by category: {category}")
        
    products = (await session.execute(q.offset(offset).limit(limit))).scalars().all()

    logger.info(f"Found {len(products)} products")

    result: List[ProductOut] = []
    for p in products:
        inv = await get_inventory_for_product_naive(session, p.id)
        result.append(ProductOut.model_validate({**p.__dict__, "inventory": inv}))
    
    logger.warning(f"Using naive inventory calculation - performed {len(products)} separate queries with 200ms latency each = {len(products) * 200}ms = {len(products) * 0.2:.1f}s overhead!")
    return result


@router.post("/checkout", response_model=CheckoutOut)
async def checkout(
    payload: CheckoutIn,
    x_scenario: Optional[str] = Header(default=None, alias="X-Scenario"),
    session: AsyncSession = Depends(get_session),
):
    logger.info(f"Starting checkout process for {payload.user_email} with {len(payload.items)} items")
    
    # naive sequential work
    subtotal = 0
    for item in payload.items:
        logger.debug(f"Processing item: product_id={item.product_id}, quantity={item.quantity}")
        
        # Simulate slow product lookup
        import asyncio
        await asyncio.sleep(0.1)  # 100ms per product lookup
        
        prod = (await session.execute(select(Product).where(Product.id == item.product_id))).scalars().first()
        if not prod:
            logger.error(f"Product {item.product_id} not found")
            continue
        inv = await get_inventory_for_product_naive(session, prod.id)
        if inv < item.quantity:
            logger.error(f"Insufficient inventory for product {prod.id}: requested={item.quantity}, available={inv}")
            raise ValueError("Out of stock")
        subtotal += prod.price_cents * item.quantity

    logger.info(f"Calculated subtotal: ${subtotal/100:.2f}")

    logger.info("Starting SEQUENTIAL checkout calculations...")
    discount = await apply_coupon_naive(session, subtotal, payload.coupon_code)
    logger.debug(f"✓ Coupon calculated: ${discount/100:.2f} discount")
    
    shipping = await shipping_quote(payload.address or "", subtotal, x_scenario)
    logger.debug(f"✓ Shipping calculated: ${shipping/100:.2f}")
    
    tax = await tax_compute(payload.address or "", subtotal)
    logger.debug(f"✓ Tax calculated: ${tax/100:.2f}")

    total = subtotal - discount + shipping + tax
    logger.info(f"Final total: ${total/100:.2f} (discount=${discount/100:.2f}, shipping=${shipping/100:.2f}, tax=${tax/100:.2f})")

    ok, auth_id = await payment_charge(payload.payment_token or "tok_demo", total, x_scenario)

    # simulate slow email
    logger.warning("Sending confirmation email synchronously - blocking the response for 1 second!")
    import asyncio
    await asyncio.sleep(1.0)  # 1 second email send blocking the response

    trace_id = sentry_sdk.get_current_scope().transaction and sentry_sdk.get_current_scope().transaction.trace_id
    
    logger.info(f"Checkout completed successfully for {payload.user_email}, order_id=1, trace_id={trace_id}")

    return CheckoutOut(order_id=1, total_cents=total, status="confirmed", trace_id=trace_id)
