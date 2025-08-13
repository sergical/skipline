# Performance Comparison: v1 vs v2

## Why v1 Feels Fast on Local

SQLite on local disk is extremely fast, making N+1 queries less noticeable. In production with a remote database, each query adds network latency.

## Simulated Latencies

To demonstrate real-world performance issues, we've added:

### v1 (Naive Implementation)
- **Inventory queries**: 200ms per product (N+1 problem)
  - 20 products = 4000ms (4 seconds!) overhead
- **Product lookups in checkout**: 100ms per product
- **Coupon lookup**: 500ms (fetches ALL coupons - full table scan)
- **Email sending**: 1000ms (1 second blocking!)
- **Checkout flow**: Sequential operations
  - Each step waits for the previous to complete

### v2 (Optimized Implementation)
- **Inventory queries**: Single aggregated query
  - 20 products = ~5ms total
- **Coupon lookup**: Indexed query with WHERE clause
  - ~5ms regardless of coupon count
- **Checkout flow**: Parallel operations
  - Coupon, shipping, and tax calculated simultaneously
- **Email**: Async (non-blocking)

## Expected Performance

### Catalog Endpoint
- **v1**: ~4-5 seconds for 20 products
- **v2**: ~50-100ms for 20 products
- **Difference**: 40-100x slower!

### Checkout Endpoint (with 3 items)
- **v1**: Sequential delays compound
  - Product lookups: 3 × 100ms = 300ms
  - Inventory checks: 3 × 200ms = 600ms
  - Coupon: 500ms
  - Shipping + Tax + Payment: ~300ms (sequential)
  - Email: 1000ms (blocking)
  - **Total: ~2.7 seconds**

- **v2**: Parallel execution
  - All queries: ~50ms
  - Shipping + Tax + Coupon: ~100ms (parallel)
  - Email: Async (non-blocking)
  - **Total: ~200-300ms**
- **Difference**: 10-15x slower!

## Real-World Impact

In production with:
- Remote database (10-50ms latency)
- 100+ products
- 1000+ coupons
- High traffic

The difference becomes dramatic:
- v1: 5-10+ seconds
- v2: <500ms

## Demo Tips

1. Watch the logs to see timing
2. Compare Sentry traces between v1 and v2
3. Note the sequential vs parallel spans
4. Check the "Performance" tab for metrics
