#!/usr/bin/env bash
# Render build script

set -e

echo "Installing dependencies..."
cd backend
pip install -r requirements.txt

echo "Setting up Python path..."
export PYTHONPATH=/opt/render/project/src/backend:$PYTHONPATH

echo "Creating database tables..."
python -c "
import asyncio
from app.db import engine, Base
async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
asyncio.run(init())
"

echo "Build complete!"
