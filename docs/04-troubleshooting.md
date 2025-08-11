## Troubleshooting

- Backend not starting: ensure Python 3.10+, `pip install -e backend` completed.
- DB empty: run `python backend/scripts/seed.py`.
- Mobile cannot reach backend: use `http://127.0.0.1:8000` and ensure device/simulator networking works. On physical device, use your machine IP.
- No traces in Sentry: verify DSN env var on backend and RN, and that trace propagation targets include localhost.
- Too fast in demo: add `X-Scenario: BlackFriday` header in Developer screen.
