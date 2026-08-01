import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "SmartPhoto AI"

def test_list_photos_endpoint():
    response = client.get("/api/v1/photos/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_categories_endpoint():
    response = client.get("/api/v1/categories/")
    assert response.status_code == 200
    assert len(response.json()) >= 6

def test_stats_endpoint():
    response = client.get("/api/v1/stats/")
    assert response.status_code == 200
    data = response.json()
    assert "total_photos" in data
    assert "categories_breakdown" in data
