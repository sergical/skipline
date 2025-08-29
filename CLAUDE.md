# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Skipline is an e-commerce demo showcasing mobile checkout performance optimization through distributed tracing and span metrics. It features two API implementations:
- **v1 (slow/naive)**: Uses chatty endpoints, N+1 database queries, and sequential processing
- **v2 (fast/optimized)**: Uses hydrated endpoints, aggregated queries, and parallelized I/O

## Architecture

- **Backend**: FastAPI + SQLAlchemy + SQLite/PostgreSQL, located in `/backend`
- **Mobile**: Expo + React Native + Zustand state management, located in `/mobile`
- **Database**: SQLite for local development, PostgreSQL for production
- **Tracing**: Sentry integration for distributed tracing and performance monitoring

## Development Commands

### Backend Development
```bash
# Setup (from project root)
python3 -m venv .venv
source .venv/bin/activate
pip install -e backend

# Run development server
uvicorn app.main:app --reload --app-dir backend

# Seed database
python backend/scripts/seed.py

# Database seeding endpoint
POST http://127.0.0.1:8000/seed-database
```

### Mobile Development
```bash
# Setup (in /mobile directory)
cd mobile
npm install

# Development
npm start          # Start Expo development server
npm run android    # Start on Android
npm run ios        # Start on iOS
npm run web        # Start web version
npm run lint       # Run ESLint

# Building
npm run build:ios     # EAS build for iOS
npm run build:android # EAS build for Android

# Testing
npm run maestro:studio # Maestro testing studio
```

## Key API Endpoints

Both v1 and v2 use identical endpoint names for easy performance comparison:
- `GET /api/v1/catalog` vs `GET /api/v2/catalog?include=inventory`
- `POST /api/v1/checkout` vs `POST /api/v2/checkout`

## Performance Testing

Use header `X-Scenario: BlackFriday` to simulate high-latency conditions for performance testing.

## Environment Configuration

### Backend (.env in /backend)
```
SENTRY_DSN=your_sentry_dsn
ENABLE_SENTRY_LOGS=true
```

### Mobile (.env in /mobile)
```
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_ENABLE_ARTIFICIAL_DELAYS=true
```

Set `EXPO_PUBLIC_ENABLE_ARTIFICIAL_DELAYS=true` to add artificial delays and frame drops for Sentry performance monitoring.\n\n## Component Performance Tracking\n\nThe mobile app includes Sentry component tracking to monitor React component performance:\n\n- **Component render times**: Track how long components take to render\n- **Component lifecycle events**: Monitor mount, unmount, and update cycles  \n- **Frame tracking**: Monitor native frame rates and stalls\n- **App start tracking**: Track application startup performance\n\n**Tracked Components:**\n- `HomeScreen` - Main product catalog screen\n- `CheckoutScreen` - Shopping cart and checkout flow\n- `OrderConfirmationScreen` - Post-purchase confirmation\n- `ExploreScreen` - Information/settings screen\n- `ProductCard` - Individual product display component (rendered multiple times)\n\nComponent performance data appears in Sentry under the \"Performance\" section with operation type `ui.react.render`.

## State Management

The mobile app uses Zustand for cart state management (`/mobile/state/useCart.ts`) with actions for add, remove, clear, and checkout payload creation.

## Key Files to Understand

- `/backend/app/routers/v1.py` - Naive API implementation
- `/backend/app/routers/v2.py` - Optimized API implementation  
- `/mobile/lib/api.ts` - API client functions
- `/mobile/state/useCart.ts` - Cart state management
- `/backend/app/services/` - Business logic (inventory, pricing, external services)