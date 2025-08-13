# Distributed Tracing Setup

## Overview
This document explains how distributed tracing is configured between the mobile app and backend to capture end-to-end traces including database queries.

## Backend Configuration

### 1. Sentry Initialization
```python
# app/main.py
enable_logs = os.getenv("ENABLE_SENTRY_LOGS", "false").lower() == "true"

sentry_sdk.init(
    dsn=dsn,
    traces_sample_rate=1.0,
    _experiments={
        "enable_logs": enable_logs,
    },
    integrations=[
        FastApiIntegration(transaction_style="endpoint"),
        SqlalchemyIntegration(),
    ],
)
```

### 2. Automatic Database Instrumentation
The `SqlalchemyIntegration` automatically instruments all database queries, including async operations. No manual spans needed!

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
const ENABLE_SENTRY_LOGS = process.env.EXPO_PUBLIC_ENABLE_SENTRY_LOGS === 'true';

Sentry.init({
  dsn: SENTRY_DSN,
  enableAutoPerformanceTracing: true,
  tracesSampleRate: 1.0,
  tracePropagationTargets: [API_HOST, /localhost:\\d+/, /127\.0\.0\.1/],
  _experiments: {
    enableLogs: ENABLE_SENTRY_LOGS,
  }
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
   - Database spans (SQLite queries - auto-instrumented)
   - External service spans (shipping, tax, payment)
   - Associated logs (if enabled) with full context

## Common Issues

### Database queries not showing
- Ensure `SqlalchemyIntegration()` is added
- Add `pool_pre_ping=True` to SQLAlchemy engine for async support
- Check that database operations use SQLAlchemy ORM/Core

### Traces not connecting
- Verify `tracePropagationTargets` includes your API host
- Check CORS allows sentry-trace and baggage headers
- Ensure both mobile and backend use same Sentry project

### Missing spans
- Set `traces_sample_rate=1.0` for development
- Check that transactions aren't dropped by sampling
- Verify Sentry quota hasn't been exceeded
