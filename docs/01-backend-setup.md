## Backend setup (FastAPI + SQLite)

Prereqs: Python 3.10+.

- Create venv and install deps
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -e backend
  ```

- Run the API (first run creates SQLite and tables)
  ```bash
  uvicorn app.main:app --reload --app-dir backend
  ```

- Seed data
  ```bash
  python backend/scripts/seed.py
  ```

- Verify endpoints
  - v1 products: `GET http://127.0.0.1:8000/api/v1/products`
  - v2 catalog: `GET http://127.0.0.1:8000/api/v2/catalog?include=inventory`
  - v1 checkout: `POST /api/v1/checkout`
  - v2 checkout: `POST /api/v2/checkout`

### Enable Sentry on backend

- Export DSN (or use wizard):
  ```bash
  export SENTRY_DSN="https://<dsn>"
  export SENTRY_TRACES_SAMPLE_RATE=1.0
  export SENTRY_PROFILES_SAMPLE_RATE=1.0
  ```
  Or run wizard:
  ```bash
  sentry-cli wizard -i python
  ```

- Restart server; you should see traces and DB spans.

### Scenario headers
- `X-Scenario: BlackFriday` will add extra latency on shipping/payment.
