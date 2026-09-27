from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "payments-service"
    assert "version" in data


def test_root() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "running" in response.json()["message"]
