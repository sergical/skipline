## Demo script (video-ready)

- (Optional) If you add a Developer screen, set:
  - Scenario: BlackFriday

- Enable logs for rich context:
  - Mobile: `EXPO_PUBLIC_ENABLE_SENTRY_LOGS=true`
  - Backend: `ENABLE_SENTRY_LOGS=true`

- Run flow:
  1. Open Catalog → observe loading skeletons, logs show product count
  2. Add to Cart from list → logs capture product details
  3. Go to Checkout → place order using coupon `SAVE10`
  4. Copy Trace ID from confirmation and open in Sentry

- Show traces & logs:
  - v1 Catalog: N+1 queries visible in traces, warning logs about inefficiency
  - v1 Checkout: Sequential spans, logs show blocking email warning
  - Logs tab: Filter by trace ID to see all related logs

- Switch to v2 (fast) - just change `/api/v1` to `/api/v2`:
  - Catalog: Single aggregated query, logs show optimization
  - Checkout: Parallel operations, no blocking warnings
  - Same endpoint names make switching seamless

- Span Metrics: compare p75/p95 on `GET /catalog` and `POST /checkout` by version.
