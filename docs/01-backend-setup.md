## Backend setup (FastAPI + SQLite)

Prereqs: Python 3.10+.

- Create venv and install deps
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -e backend
  ```

- Create a `.env` file in the backend directory
  ```bash
  cp backend/.env-example backend/.env
  # Edit backend/.env to set your SENTRY_DSN
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
  - v1 catalog: `GET http://127.0.0.1:8000/api/v1/catalog`
  - v2 catalog: `GET http://127.0.0.1:8000/api/v2/catalog?include=inventory`
  - v1 checkout: `POST /api/v1/checkout`
  - v2 checkout: `POST /api/v2/checkout`

### Enable Sentry on backend

- Set up Sentry in your `.env` file:
  ```bash
  # backend/.env
  SENTRY_DSN="https://<your-dsn>"
  ENABLE_SENTRY_LOGS=true  # Optional: Enable Sentry logs
  ```
  Or run wizard:
  ```bash
  sentry-cli wizard -i python
  ```

- Restart server; you should see traces, DB spans, and logs (if enabled).

### Scenario headers
- `X-Scenario: BlackFriday` will add extra latency on shipping/payment.
