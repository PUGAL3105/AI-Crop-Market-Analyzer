import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

# Module-level session token storage
auth_token = ""

# Fixture to initialize the test client inside a context manager
# This triggers the FastAPI startup event to migrate and seed the database
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_read_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["project"] == "AgriPredict Pro"

def test_login_seeding(client):
    global auth_token
    # Log in using default farmer credentials seeded during startup
    response = client.post("/api/auth/login", json={
        "email": "farmer@agripredict.pro",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "farmer"
    auth_token = data["access_token"]

def test_get_current_user(client):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "farmer@agripredict.pro"

def test_weather_forecast(client):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/weather?district=Chennai", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Chennai"
    assert "temperature" in data
    assert len(data["forecast"]) > 0

def test_prediction_endpoint(client):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/predictions/predict", headers=headers, json={
        "crop": "Rice",
        "district": "Chennai",
        "market": "Koyambedu Market",
        "quantity": 500.0,
        "harvest_date": "2026-08-01"
    })
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert data["expected_profit"] == data["predicted_price"] * 500.0
    assert "shap_explanations" in data
    assert "confidence_score" in data

def test_recommendation_endpoint(client):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/markets/recommend", headers=headers, json={
        "crop": "Rice",
        "quantity_kg": 1000.0,
        "harvest_date": "2026-08-01",
        "current_district": "Chennai"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["crop_name"] == "Rice"
    assert len(data["recommendations"]) > 0
    assert "net_profit" in data["recommendations"][0]
