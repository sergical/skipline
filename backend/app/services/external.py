from __future__ import annotations

import asyncio
import os
import random
from typing import Tuple


async def shipping_quote(address: str, subtotal_cents: int, scenario: str | None = None) -> int:
    # Simulate external latency; v1 has more variance
    base = 80
    jitter = 40
    if scenario == "BlackFriday":
        base, jitter = 180, 220
    delay_ms = base + random.randint(0, jitter)
    await asyncio.sleep(delay_ms / 1000.0)
    return 599 if subtotal_cents < 5000 else 0


async def tax_compute(address: str, subtotal_cents: int) -> int:
    await asyncio.sleep(40 / 1000.0)
    return int(subtotal_cents * 0.08)


async def payment_charge(payment_token: str, total_cents: int, scenario: str | None = None) -> Tuple[bool, str]:
    base = 120
    jitter = 60
    if scenario == "BlackFriday":
        base, jitter = 240, 220
    await asyncio.sleep((base + random.randint(0, jitter)) / 1000.0)
    return True, "auth_" + str(random.randint(10000, 99999))
