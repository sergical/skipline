## Demo script (video-ready)

- In mobile Developer screen set:
  - API: v1 (slow)
  - Scenario: BlackFriday

- Run flow:
  1. Open Catalog → observe loading skeletons
  2. Tap Product → Add to Cart (haptics)
  3. Open Cart → Checkout using code `SAVE10`
  4. Copy Trace ID from Developer screen and open in Sentry

- Show traces:
  - Catalog shows client waterfall → many `/product` requests (v1 list N+1 via inventory)
  - Checkout shows sequential spans: inventory.verify, shipping.quote, tax.compute, payment.charge, email.send

- Switch to v2 (fast):
  - Catalog returns hydrated items in one request with aggregated DB span
  - Checkout parallelizes and enqueues email; faster critical path

- Span Metrics: compare p75/p95 on `GET /catalog` and `POST /checkout` by environment/release.
