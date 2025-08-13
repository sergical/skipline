from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Coupon, Product


async def apply_coupon_naive(session: AsyncSession, subtotal_cents: int, coupon_code: Optional[str]) -> int:
    if not coupon_code:
        return 0
    # Intentionally naive: scan all coupons in Python
    # Simulate fetching ALL coupons from remote database
    import asyncio
    await asyncio.sleep(0.5)  # 500ms for fetching all coupons (large table scan)
    
    coupons = (await session.execute(select(Coupon))).scalars().all()
    now = datetime.utcnow()
    for c in coupons:
        if c.code == coupon_code and c.starts_at <= now <= c.ends_at and subtotal_cents >= c.min_subtotal_cents:
            return int(subtotal_cents * (c.percent_off / 100.0))
    return 0


async def apply_coupon_fast(
    session: AsyncSession,
    subtotal_cents: int,
    coupon_code: Optional[str],
    category_id: Optional[int] = None,
) -> int:
    if not coupon_code:
        return 0
    now = datetime.utcnow()
    stmt = select(Coupon).where(
        and_(
            Coupon.code == coupon_code,
            Coupon.starts_at <= now,
            Coupon.ends_at >= now,
            Coupon.min_subtotal_cents <= subtotal_cents,
        )
    )
    coupon = (await session.execute(stmt)).scalars().first()
    if not coupon:
        return 0
    return int(subtotal_cents * (coupon.percent_off / 100.0))
