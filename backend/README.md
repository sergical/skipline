# Skipline Backend

FastAPI backend for the Skipline fast checkout demo.

## Setup

1. **Create and activate a virtual environment** (from the project root):
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -e backend/
   ```

3. **Seed the database** (optional, for demo data):
   ```bash
   python backend/scripts/seed.py
   ```

4. **Start the development server**:
   ```bash
   uvicorn app.main:app --reload --app-dir backend
   ```

The server will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can view the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Requirements

- Python 3.10+
- Dependencies listed in `pyproject.toml`
