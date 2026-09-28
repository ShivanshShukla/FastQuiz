from typing import Any, Literal
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.core.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Purchases & Financial Ledger"])


class Purchase(BaseModel):
    id: str
    user_id: str
    user_email: str
    item_title: str
    amount: float
    payment_provider_ref: str
    status: Literal["completed", "pending", "failed", "refunded"]
    created_at: str


PURCHASES_DB: list[dict[str, Any]] = [
    {
        "id": "pur-101",
        "user_id": "usr-1",
        "user_email": "sarah.connor@sky.net",
        "item_title": "System Design Fundamentals Bundle",
        "amount": 14.99,
        "payment_provider_ref": "pay_rzp_984328943",
        "status": "completed",
        "created_at": "2026-09-27T14:10:00Z",
    },
    {
        "id": "pur-102",
        "user_id": "usr-2",
        "user_email": "dev.marcus@gmail.com",
        "item_title": "Two-Pointer Technique Quiz",
        "amount": 4.99,
        "payment_provider_ref": "pay_rzp_118932402",
        "status": "completed",
        "created_at": "2026-09-27T15:30:00Z",
    },
    {
        "id": "pur-103",
        "user_id": "usr-3",
        "user_email": "candidate.john@outlook.com",
        "item_title": "Sliding Window Mastery",
        "amount": 3.99,
        "payment_provider_ref": "pay_rzp_773298114",
        "status": "failed",
        "created_at": "2026-09-27T16:05:00Z",
    },
    {
        "id": "pur-104",
        "user_id": "usr-4",
        "user_email": "alex.tanaka@tokyo.ac.jp",
        "item_title": "Concurrency & OS Concepts Quiz",
        "amount": 4.99,
        "payment_provider_ref": "pay_rzp_552190823",
        "status": "refunded",
        "created_at": "2026-09-26T09:20:00Z",
    },
]


@router.get("/purchases", response_model=list[Purchase])
async def list_admin_purchases(
    status: str = Query("all", description="Filter by purchase status"),
    user_id: str | None = Query(None, description="Filter by user id"),
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> list[Purchase]:
    """Returns ledger transactions matching filters."""
    result = list(PURCHASES_DB)
    if status != "all":
        result = [p for p in result if p["status"] == status]
    if user_id:
        result = [p for p in result if p["user_id"] == user_id]
    return [Purchase(**p) for p in result]
