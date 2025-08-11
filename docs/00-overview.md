## Skipline overview

Skipline is a modern e-commerce demo designed to highlight mobile checkout performance, distributed tracing, and span metrics via two API styles:

- v1 (slow/naive): chatty endpoints, N+1 database patterns, sequential work in checkout.
- v2 (fast/optimized): hydrated endpoints, aggregated queries, parallelized IO, backgrounded work.

### Identity
- Name: Skipline
- Palette: Deep Teal #0B6E6E, Coral #FF6B5A, Indigo #253858, Sand #F6F2EC, Emerald #2E7D32, Saffron #FFB300
- Typography: Inter/SF Pro

### Demo flow
1. Browse catalog
2. Product detail → add to cart
3. Cart → checkout with coupon `SAVE10`
4. Inspect trace IDs and span metrics

### Scenarios
- Add header `X-Scenario: BlackFriday` to amplify latencies.
