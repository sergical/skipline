# Sentry Logs Integration

This project includes Sentry Logs integration for both the mobile app and backend, allowing you to capture structured logs alongside traces and errors.

## Overview

Sentry Logs provide:
- Structured logging with searchable attributes
- Automatic correlation with traces and errors
- Different log levels (trace, debug, info, warn, error, fatal)
- Performance context for debugging issues

## Mobile App Logs

### Configuration

Set the environment variable to enable logs:
```bash
# mobile/.env
EXPO_PUBLIC_ENABLE_SENTRY_LOGS=true
```

### Usage Examples

The mobile app logs key user actions and performance data:

```typescript
// Product catalog loading
Sentry.logger.info('Product catalog loaded', {
  productCount: data.length,
  isRefresh: false,
});

// Cart operations
Sentry.logger.info('Product added to cart', {
  productId: item.id,
  productName: item.name,
  price: item.price_cents / 100,
});

// Checkout process
Sentry.logger.info('Starting checkout process', {
  userEmail: email,
  itemCount: items.length,
  subtotal: subtotal / 100,
  hasCoupon: !!coupon,
});

// Errors
Sentry.logger.error('Checkout failed', {
  error: e?.message || 'Unknown error',
  userEmail: email,
});
```

## Backend Logs

### Configuration

Set the environment variable to enable logs:
```bash
# backend/.env
ENABLE_SENTRY_LOGS=true
```

### Usage Examples

The backend logs API operations and performance warnings:

```python
# Product listings
logger.info(f"Found {len(products)} products")
logger.warning(f"Using naive inventory calculation - performed {len(products)} separate queries")

# Checkout process
logger.info(f"Starting checkout process for {payload.user_email} with {len(payload.items)} items")
logger.info(f"Final total: ${total/100:.2f} (discount=${discount/100:.2f}, shipping=${shipping/100:.2f}, tax=${tax/100:.2f})")

# Performance warnings
logger.warning("Sending confirmation email synchronously - blocking the response")

# Errors
logger.error(f"Product {item.product_id} not found")
logger.error(f"Insufficient inventory for product {prod.id}: requested={item.quantity}, available={inv}")
```

## Viewing Logs in Sentry

1. Navigate to your Sentry project
2. Go to "Logs" in the sidebar (Beta feature)
3. Filter by:
   - Log level (info, warning, error)
   - Time range
   - Custom attributes (userEmail, productId, etc.)
   - Trace ID to see all logs for a specific transaction

## Best Practices

1. **Use appropriate log levels:**
   - `debug`: Detailed information for debugging
   - `info`: General informational messages
   - `warning`: Performance issues or deprecations
   - `error`: Recoverable errors

2. **Include context attributes:**
   - User identifiers
   - Object IDs (products, orders)
   - Numeric values (prices, quantities)
   - Performance metrics

3. **Correlate with traces:**
   - Logs are automatically associated with the active trace
   - Use trace IDs to find all related logs, spans, and errors

4. **Performance considerations:**
   - Logs have minimal overhead but can add up
   - Use debug/trace levels sparingly in production
   - Consider sampling for high-volume operations

## Demo Scenarios

The logs are particularly useful for demonstrating:

1. **N+1 Query Problems**: v1 API logs show individual inventory queries
2. **Sequential vs Parallel Processing**: Compare log timings between v1 and v2
3. **User Journey**: Track a user from catalog browsing to checkout completion
4. **Error Debugging**: See the full context when checkout fails
