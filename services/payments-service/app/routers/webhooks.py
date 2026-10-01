import hashlib
import hmac
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request

from app.core.config import settings

router = APIRouter(prefix="/webhooks", tags=["Payment Provider Webhooks"])

PROCESSED_WEBHOOK_EVENTS: set[str] = set()


def verify_webhook_signature(
    raw_body: bytes, signature: str | None, secret: str
) -> bool:
    if not signature:
        return False
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(None, alias="X-Razorpay-Signature"),
) -> dict[str, Any]:
    raw_body = await request.body()

    if not verify_webhook_signature(
        raw_body, x_razorpay_signature, settings.WEBHOOK_SECRET
    ):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event_id = payload.get("id") or payload.get("event_id")

    if event_id and event_id in PROCESSED_WEBHOOK_EVENTS:
        return {
            "status": "ignored",
            "reason": "idempotent_duplicate",
            "event_id": event_id,
        }

    if event_id:
        PROCESSED_WEBHOOK_EVENTS.add(event_id)

    event_type = payload.get("event", "")
    if event_type == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        return {
            "status": "processed",
            "action": "entitlement_granted",
            "payment_id": payment_entity.get("id"),
            "amount": payment_entity.get("amount"),
        }
    elif event_type == "payment.failed":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        return {
            "status": "processed",
            "action": "payment_failed",
            "reason": payment_entity.get("error_description"),
        }
    elif event_type == "refund.processed":
        return {
            "status": "processed",
            "action": "refund_recorded",
        }

    return {"status": "received", "event": event_type}
