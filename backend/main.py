"""
Vercel standard entrypoint for FastAPI backend in backend/main.py.
"""
import os
import sys

# Ensure backend and ML directories are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
ml_dir = os.path.join(root_dir, "ml", "src")

for path in [current_dir, root_dir, ml_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from app.main import app  # noqa: F401

# Re-export app ASGI instance for Vercel Python runtime
app = app
