from __future__ import annotations

from typing import Dict, List

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import InventoryMovement


async def get_inventory_for_product_naive(session: AsyncSession, product_id: int) -> int:
    # Intentionally naive: sum in Python with multiple round-trips
    # Simulate network latency for remote database
    import asyncio
    await asyncio.sleep(0.05)  # 50ms simulated DB latency
    
    movements = (await session.execute(select(InventoryMovement).where(InventoryMovement.product_id == product_id))).scalars().all()
    total = 0
    for m in movements:
        total += m.delta
    return total


async def get_inventory_for_products_aggregated(session: AsyncSession, product_ids: List[int]) -> Dict[int, int]:
    if not product_ids:
        return {}
    stmt: Select = (
        select(InventoryMovement.product_id, func.sum(InventoryMovement.delta))
        .where(InventoryMovement.product_id.in_(product_ids))
        .group_by(InventoryMovement.product_id)
    )
    rows = await session.execute(stmt)
    return {pid: int(total or 0) for pid, total in rows.all()}
