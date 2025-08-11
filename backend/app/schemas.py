from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    category_id: int
    price_cents: int
    image_url: Optional[str]
    inventory: Optional[int] = None

    class Config:
        from_attributes = True


class CartItemIn(BaseModel):
    product_id: int
    quantity: int


class CheckoutIn(BaseModel):
    user_email: str
    items: List[CartItemIn]
    coupon_code: Optional[str] = None
    address: Optional[str] = None
    payment_token: Optional[str] = None


class CheckoutOut(BaseModel):
    order_id: int
    total_cents: int
    status: str
    trace_id: Optional[str] = None
