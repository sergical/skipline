## Demo script (video-ready)

- (Optional) If you add a Developer screen, set:
  - Scenario: BlackFriday

- Run flow:
  1. Open Catalog → observe loading skeletons
  2. Add to Cart from list
  3. Go to Checkout → place order using coupon `SAVE10`
  4. Copy Trace ID from confirmation and open in Sentry

- Show traces:
  - Catalog shows client waterfall → many `/product` requests (v1 list N+1 via inventory)
  - Checkout shows sequential spans: inventory.verify, shipping.quote, tax.compute, payment.charge, email.send

- Switch to v2 (fast) by using `/api/v2` paths in the app (already configured):
  - Catalog returns hydrated items in one request with aggregated DB span
  - Checkout parallelizes and enqueues email; faster critical path

- Span Metrics: compare p75/p95 on `GET /catalog` and `POST /checkout` by environment/release.
