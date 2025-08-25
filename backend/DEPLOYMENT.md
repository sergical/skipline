# Skipline Backend Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended - 5 minutes)

```bash
# Install Railway CLI
brew install railway

# Deploy
cd backend
railway login
railway up

# Set environment variables in Railway dashboard:
# - SENTRY_DSN
# - ENABLE_SENTRY_LOGS=true
```

Railway automatically:
- Detects Python/FastAPI
- Provisions PostgreSQL
- Handles migrations
- Provides HTTPS URL

### 2. Render 

1. Push to GitHub
2. Connect repo on render.com
3. Use these settings:
   - Build: `pip install -e backend`
   - Start: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add PostgreSQL database

### 3. Fly.io (Keeps SQLite!)

```bash
cd backend
fly launch
fly volumes create skipline_data --size 1
fly deploy
```

## Database Management

### Export Data (Before Migration)
```bash
cd backend
python scripts/db_manager.py export -o backup.json
```

### View Current Inventory
```bash
python scripts/db_manager.py inventory
```

### Adjust Inventory
```bash
# Add 50 units to product ID 1
python scripts/db_manager.py adjust 1 50 -r "New shipment"

# Remove 10 units from product ID 2
python scripts/db_manager.py adjust 2 -10 -r "Sale"
```

## Environment Variables

Required for all deployments:
```env
# Sentry (optional but recommended)
SENTRY_DSN=your_sentry_dsn
ENABLE_SENTRY_LOGS=true

# Database (auto-set by most platforms)
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

## Post-Deployment

1. **Update Mobile App**:
   ```bash
   # In mobile/.env
   EXPO_PUBLIC_API_BASE_URL=https://your-backend.railway.app
   ```

2. **Seed Initial Data**:
   ```bash
   # SSH into deployment or use web console
   python backend/scripts/seed.py
   ```

3. **Monitor with Sentry**:
   - View traces at sentry.io
   - Check performance insights
   - Monitor errors and logs

## Database Migration (SQLite → PostgreSQL)

The backend automatically handles both databases. When `DATABASE_URL` is set (by deployment platforms), it uses PostgreSQL. Otherwise, it falls back to SQLite.

### Manual Migration Steps:

1. Export from SQLite:
   ```bash
   python scripts/db_manager.py export -o prod_data.json
   ```

2. Deploy to platform (creates PostgreSQL)

3. Import to PostgreSQL:
   ```bash
   # Create a custom import script or use seed.py as template
   ```

## Cost Comparison

| Platform | Free Tier | Database | Pros | Cons |
|----------|-----------|----------|------|------|
| Railway | $5 credit/mo | PostgreSQL included | Easy, fast | Limited free tier |
| Render | 750hrs/mo | PostgreSQL 1GB | Generous free tier | Slow cold starts |
| Fly.io | 3 VMs free | SQLite with volumes | Fast, persistent SQLite | More complex |
| Vercel | Unlimited | External DB needed | Great for frontend | Serverless limitations |

## Troubleshooting

### "Can't connect to database"
- Check `DATABASE_URL` is set correctly
- For PostgreSQL, ensure it starts with `postgresql://` not `postgres://`

### "Inventory not showing"
- Run seed script: `python backend/scripts/seed.py`
- Check inventory: `python scripts/db_manager.py inventory`

### "CORS errors"
- Backend already configured for all origins
- Ensure you're using HTTPS in production
