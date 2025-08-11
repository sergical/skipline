backend-run:
	uvicorn app.main:app --reload --app-dir backend

backend-seed:
	python backend/scripts/seed.py

