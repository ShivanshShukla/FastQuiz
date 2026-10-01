from datetime import UTC, datetime, timedelta

import jwt
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def test_public_root_endpoint_health() -> None:
    res = client.get("/")
    assert res.status_code == 200
    assert "FastQuiz Quiz Service" in res.json()["message"]


def test_expired_token_rejected_from_admin_quiz() -> None:
    past_timestamp = datetime.now(UTC) - timedelta(hours=2)
    payload = {
        "sub": "usr-expired",
        "email": "expired@fastquiz.dev",
        "role": "super_admin",
        "aud": settings.ADMIN_JWT_AUDIENCE,
        "iss": "fastquiz-auth-service",
        "exp": int(past_timestamp.timestamp()),
    }
    expired_token = jwt.encode(
        payload, settings.ADMIN_JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    res = client.get(
        "/admin/topics", headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert res.status_code == 401


def test_malformed_authorization_header_rejected() -> None:
    res = client.get("/admin/topics", headers={"Authorization": "NotBearerToken"})
    assert res.status_code == 401


def test_wrong_signature_token_rejected() -> None:
    payload = {
        "sub": "usr-attacker",
        "email": "attacker@darkweb.org",
        "role": "super_admin",
        "aud": settings.ADMIN_JWT_AUDIENCE,
        "iss": "fastquiz-auth-service",
    }
    fake_token = jwt.encode(
        payload, "wrong-secret-key-12345", algorithm=settings.JWT_ALGORITHM
    )
    res = client.get("/admin/topics", headers={"Authorization": f"Bearer {fake_token}"})
    assert res.status_code == 401
