#!/usr/bin/env python3
"""
Database management script for Skipline backend.
Handles export/import of data for migrations and inventory management.
"""
import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.db import SessionLocal
from app.models import Product, Category, InventoryMovement, Coupon, User, Order, OrderItem


async def export_data(output_file: str = "skipline_backup.json"):
    """Export all data from the database to JSON."""
    async with SessionLocal() as session:
        # Export categories
        categories = await session.execute(select(Category))
        categories_data = [
            {"id": c.id, "name": c.name, "slug": c.slug} 
            for c in categories.scalars()
        ]
        
        # Export products
        products = await session.execute(select(Product))
        products_data = [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "category_id": p.category_id,
                "price_cents": p.price_cents,
                "image_url": p.image_url,
            }
            for p in products.scalars()
        ]
        
        # Export inventory movements
        movements = await session.execute(select(InventoryMovement))
        movements_data = [
            {
                "id": m.id,
                "product_id": m.product_id,
                "delta": m.delta,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in movements.scalars()
        ]
        
        # Export coupons
        coupons = await session.execute(select(Coupon))
        coupons_data = [
            {
                "id": c.id,
                "code": c.code,
                "percent_off": c.percent_off,
                "starts_at": c.starts_at.isoformat() if c.starts_at else None,
                "ends_at": c.ends_at.isoformat() if c.ends_at else None,
                "min_subtotal_cents": c.min_subtotal_cents,
                "applies_to_category_id": c.applies_to_category_id,
            }
            for c in coupons.scalars()
        ]
        
        # Export users
        users = await session.execute(select(User))
        users_data = [
            {"id": u.id, "email": u.email}
            for u in users.scalars()
        ]
        
        # Export orders
        orders = await session.execute(select(Order))
        orders_data = [
            {
                "id": o.id,
                "user_id": o.user_id,
                "subtotal_cents": o.subtotal_cents,
                "discount_cents": o.discount_cents,
                "shipping_cents": o.shipping_cents,
                "tax_cents": o.tax_cents,
                "total_cents": o.total_cents,
                "status": o.status,
            }
            for o in orders.scalars()
        ]
        
        # Export order items
        order_items = await session.execute(select(OrderItem))
        order_items_data = [
            {
                "id": oi.id,
                "order_id": oi.order_id,
                "product_id": oi.product_id,
                "quantity": oi.quantity,
                "unit_price_cents": oi.unit_price_cents,
            }
            for oi in order_items.scalars()
        ]
        
        # Save to file
        data = {
            "exported_at": datetime.now().isoformat(),
            "categories": categories_data,
            "products": products_data,
            "inventory_movements": movements_data,
            "coupons": coupons_data,
            "users": users_data,
            "orders": orders_data,
            "order_items": order_items_data,
        }
        
        with open(output_file, "w") as f:
            json.dump(data, f, indent=2)
        
        print(f"✅ Data exported to {output_file}")
        print(f"   - {len(categories_data)} categories")
        print(f"   - {len(products_data)} products")
        print(f"   - {len(movements_data)} inventory movements")
        print(f"   - {len(coupons_data)} coupons")
        print(f"   - {len(users_data)} users")
        print(f"   - {len(orders_data)} orders")
        print(f"   - {len(order_items_data)} order items")


async def get_current_inventory():
    """Calculate and display current inventory levels."""
    async with SessionLocal() as session:
        # Get all products
        products = await session.execute(select(Product))
        
        print("\n📦 Current Inventory Levels:")
        print("-" * 60)
        print(f"{'Product':<30} {'Current Stock':<15} {'Price':<10}")
        print("-" * 60)
        
        for product in products.scalars():
            # Calculate inventory from movements
            movements = await session.execute(
                select(InventoryMovement).where(
                    InventoryMovement.product_id == product.id
                )
            )
            
            inventory = sum(m.delta for m in movements.scalars())
            price = f"${product.price_cents / 100:.2f}"
            
            # Color code based on stock level
            if inventory <= 0:
                status = "🔴"
            elif inventory < 10:
                status = "🟡"
            else:
                status = "🟢"
                
            print(f"{status} {product.name:<28} {inventory:<15} {price:<10}")


async def adjust_inventory(product_id: int, delta: int, reason: str = "Manual adjustment"):
    """Adjust inventory for a specific product."""
    async with SessionLocal() as session:
        # Check product exists
        product = await session.get(Product, product_id)
        if not product:
            print(f"❌ Product with ID {product_id} not found")
            return
            
        # Create inventory movement
        movement = InventoryMovement(
            product_id=product_id,
            delta=delta
        )
        session.add(movement)
        await session.commit()
        
        # Calculate new inventory
        movements = await session.execute(
            select(InventoryMovement).where(
                InventoryMovement.product_id == product_id
            )
        )
        inventory = sum(m.delta for m in movements.scalars())
        
        print(f"✅ Inventory adjusted for {product.name}")
        print(f"   Change: {'+' if delta > 0 else ''}{delta}")
        print(f"   New inventory: {inventory}")
        print(f"   Reason: {reason}")


async def main():
    """Main CLI interface."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Skipline Database Manager")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Export command
    export_parser = subparsers.add_parser("export", help="Export database to JSON")
    export_parser.add_argument("-o", "--output", default="skipline_backup.json", help="Output file")
    
    # Inventory command
    inv_parser = subparsers.add_parser("inventory", help="Show current inventory")
    
    # Adjust inventory command
    adjust_parser = subparsers.add_parser("adjust", help="Adjust product inventory")
    adjust_parser.add_argument("product_id", type=int, help="Product ID")
    adjust_parser.add_argument("delta", type=int, help="Inventory change (+ or -)")
    adjust_parser.add_argument("-r", "--reason", default="Manual adjustment", help="Reason for adjustment")
    
    args = parser.parse_args()
    
    if args.command == "export":
        await export_data(args.output)
    elif args.command == "inventory":
        await get_current_inventory()
    elif args.command == "adjust":
        await adjust_inventory(args.product_id, args.delta, args.reason)
    else:
        parser.print_help()


if __name__ == "__main__":
    asyncio.run(main())
