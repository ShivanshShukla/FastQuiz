import jwt
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def make_admin_token(role: str = "super_admin") -> str:
    payload = {
        "sub": "usr-admin-test-1",
        "email": "admin@fastquiz.dev",
        "name": "Alex Reviewer",
        "role": role,
        "aud": settings.ADMIN_JWT_AUDIENCE,
        "iss": "fastquiz-auth-service",
    }
    return jwt.encode(
        payload, settings.ADMIN_JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )


def test_unauthenticated_purchases_rejected():
    res = client.get("/admin/purchases")
    assert res.status_code == 401


def test_list_purchases_success():
    token = make_admin_token()
    res = client.get("/admin/purchases", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_filter_purchases_by_status():
    token = make_admin_token()
    res = client.get(
        "/admin/purchases?status=completed",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert all(p["status"] == "completed" for p in res.json())
