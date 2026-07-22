"""
Vercel serverless entrypoint for the FastAPI backend.
Vercel's Python runtime looks for `api/index.py` and expects an `app` ASGI object.
"""
import sys
import os

# Resolve paths so all backend imports work correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "src")))

from app.main import app  # noqa: F401  – re-export the FastAPI app
