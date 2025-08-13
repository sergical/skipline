# Distributed Tracing Setup

## Overview
This document explains how distributed tracing is configured between the mobile app and backend to capture end-to-end traces including database queries.

## Backend Configuration

### 1. Sentry Initialization
```python
# app/main.py
sentry_sdk.init(
    dsn=dsn,
    traces_sample_rate=1.0,
    integrations=[
        FastApiIntegration(transaction_style="endpoint"),
        StarletteIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
    ],
)
```

### 2. Manual Database Spans
Since async SQLAlchemy doesn't automatically instrument queries, we wrap them manually:

```python
# app/services/inventory.py
with sentry_sdk.start_span(op="db.query", description="SELECT products") as span:
    span.set_data("db.system", "sqlite")
    products = (await session.execute(query)).scalars().all()
```

### 3. CORS Headers
Allow trace propagation headers:
```python
app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],  # Allows sentry-trace and baggage
    expose_headers=["*"]
)
```

## Mobile Configuration

### 1. Sentry Initialization
```typescript
// app/_layout.tsx
Sentry.init({
  dsn: SENTRY_DSN,
  enableAutoPerformanceTracing: true,
  tracesSampleRate: 1.0,
  tracePropagationTargets: [API_HOST, /localhost:\\d+/, /127\.0\.0\.1/],
})
```

### 2. API Client
With `enableAutoPerformanceTracing` and proper `tracePropagationTargets`, Sentry automatically:
- Instruments fetch requests
- Adds sentry-trace and baggage headers
- Links mobile spans to backend traces

```typescript
// lib/api.ts
return Sentry.startSpan(
  { name: `GET ${path}`, op: 'http.client' },
  async span => {
    const res = await fetch(url, { headers: headers() });
    // Sentry auto-adds trace headers when URL matches tracePropagationTargets
  }
)
```

## Viewing Traces

1. Complete a checkout flow in the mobile app
2. Note the trace ID shown in the confirmation
3. Open Sentry and search for the trace ID
4. You should see:
   - Mobile spans (UI interactions, API calls)
   - Backend spans (FastAPI endpoints)
   - Database spans (SQLite queries)
   - External service spans (shipping, tax, payment)

## Common Issues

### Database queries not showing
- Ensure `SqlalchemyIntegration()` is added
- Wrap async queries with manual spans
- Check that spans have proper `op="db.query"`

### Traces not connecting
- Verify `tracePropagationTargets` includes your API host
- Check CORS allows sentry-trace and baggage headers
- Ensure both mobile and backend use same Sentry project

### Missing spans
- Set `traces_sample_rate=1.0` for development
- Check that transactions aren't dropped by sampling
- Verify Sentry quota hasn't been exceeded
