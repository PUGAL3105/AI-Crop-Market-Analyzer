"""
Vercel serverless entrypoint for the FastAPI backend service.
Exposes the `app` ASGI application for Vercel's Python runtime.
"""
import sys
import os

# Add backend directory and parent directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, ".."))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))
ml_dir = os.path.join(root_dir, "ml", "src")

for path in [backend_dir, root_dir, ml_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

try:
    from app.main import app
except ImportError:
    from backend.app.main import app  # Fallback for nested module lookup

# Re-export ASGI app
app = app
