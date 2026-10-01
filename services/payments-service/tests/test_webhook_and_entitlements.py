import hashlib
import hmac
import json

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.routers.webhooks import PROCESSED_WEBHOOK_EVENTS

client = TestClient(app)


def compute_signature(payload_bytes: bytes, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()


def setup_function() -> None:
    PROCESSED_WEBHOOK_EVENTS.clear()


def test_webhook_missing_signature_rejected() -> None:
    response = client.post(
        "/webhooks/razorpay",
        json={"event": "payment.captured"},
    )
    assert response.status_code == 400
    assert "Invalid webhook signature" in response.json()["detail"]


def test_webhook_invalid_signature_rejected() -> None:
    payload = json.dumps({"event": "payment.captured"}).encode("utf-8")
    response = client.post(
        "/webhooks/razorpay",
        content=payload,
        headers={
            "Content-Type": "application/json",
            "X-Razorpay-Signature": "tampered_signature_hex",
        },
    )
    assert response.status_code == 400
    assert "Invalid webhook signature" in response.json()["detail"]


def test_webhook_valid_signature_processes_payment_captured() -> None:
    body = {
        "id": "evt_test_101",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_8877",
                    "amount": 1499,
                    "currency": "INR",
                    "status": "captured",
                }
            }
        },
    }
    raw = json.dumps(body).encode("utf-8")
    sig = compute_signature(raw, settings.WEBHOOK_SECRET)

    response = client.post(
        "/webhooks/razorpay",
        content=raw,
        headers={
            "Content-Type": "application/json",
            "X-Razorpay-Signature": sig,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "processed"
    assert data["action"] == "entitlement_granted"
    assert data["payment_id"] == "pay_test_8877"


def test_webhook_idempotency_duplicate_event_safely_ignored() -> None:
    body = {
        "id": "evt_idempotent_duplicate",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_test_9999",
                    "amount": 2999,
                }
            }
        },
    }
    raw = json.dumps(body).encode("utf-8")
    sig = compute_signature(raw, settings.WEBHOOK_SECRET)

    # First delivery
    res1 = client.post(
        "/webhooks/razorpay",
        content=raw,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
    )
    assert res1.status_code == 200
    assert res1.json()["status"] == "processed"

    # Duplicate delivery
    res2 = client.post(
        "/webhooks/razorpay",
        content=raw,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
    )
    assert res2.status_code == 200
    assert res2.json()["status"] == "ignored"
    assert res2.json()["reason"] == "idempotent_duplicate"


def test_webhook_payment_failed_records_failure() -> None:
    body = {
        "id": "evt_failed_01",
        "event": "payment.failed",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_failed_123",
                    "error_description": "Card bank declined transaction",
                }
            }
        },
    }
    raw = json.dumps(body).encode("utf-8")
    sig = compute_signature(raw, settings.WEBHOOK_SECRET)

    response = client.post(
        "/webhooks/razorpay",
        content=raw,
        headers={"Content-Type": "application/json", "X-Razorpay-Signature": sig},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "processed"
    assert data["action"] == "payment_failed"
    assert "declined" in data["reason"]
