import datetime
import json
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.rate_limit import get_redis_client
from app.models.admin import Admin, AdminAuditLog
from app.models.user import User
from app.routers.admin_auth import get_current_admin
from app.schemas.admin_dashboard import (
    AdminAttentionData,
    AdminAttentionItem,
    AdminAuditActivityItem,
    AdminDashboardMetricDelta,
    AdminDashboardSummary,
    AdminFunnelData,
    AdminFunnelStep,
    AdminRecentPurchase,
    AdminRecentSignup,
    AdminTimeseriesData,
    AdminTimeseriesPoint,
    AdminTopQuizItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard & Analytics"])


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC)


@router.get("/summary", response_model=AdminDashboardSummary)
async def get_dashboard_summary(
    range: str = Query("7d", description="Date range: today, 7d, 30d, custom"),
    from_date: str | None = Query(None, alias="from"),
    to_date: str | None = Query(None, alias="to"),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminDashboardSummary:
    cache_key = f"admin:dashboard:summary:{range}:{from_date}:{to_date}"
    redis = get_redis_client()

    try:
        cached = await redis.get(cache_key)
        if cached:
            return AdminDashboardSummary(**json.loads(cached))
    except Exception as e:
        logger.warning("Redis cache read failed: %s", e)

    now = utc_now()
    one_day_ago = now - datetime.timedelta(days=1)
    seven_days_ago = now - datetime.timedelta(days=7)
    thirty_days_ago = now - datetime.timedelta(days=30)

    # Count real users in DB
    user_count_res = await db.execute(select(func.count(User.id)))
    registered_users = user_count_res.scalar() or 0

    # Suspended users
    suspended_count_res = await db.execute(
        select(func.count(User.id)).where(User.status == "suspended")
    )
    suspended_count = suspended_count_res.scalar() or 0

    # DAU (active in last 24h)
    dau_res = await db.execute(
        select(func.count(User.id)).where(User.last_seen_at >= one_day_ago)
    )
    dau_count = dau_res.scalar() or 0

    # WAU (active in last 7d)
    wau_res = await db.execute(
        select(func.count(User.id)).where(User.last_seen_at >= seven_days_ago)
    )
    wau_count = wau_res.scalar() or 0

    # MAU (active in last 30d)
    mau_res = await db.execute(
        select(func.count(User.id)).where(User.last_seen_at >= thirty_days_ago)
    )
    mau_count = mau_res.scalar() or 0

    # New signups in current range
    if range == "today":
        range_start = one_day_ago
        prev_range_start = now - datetime.timedelta(days=2)
        prev_range_end = one_day_ago
    elif range == "30d":
        range_start = thirty_days_ago
        prev_range_start = now - datetime.timedelta(days=60)
        prev_range_end = thirty_days_ago
    else:  # 7d or custom
        range_start = seven_days_ago
        prev_range_start = now - datetime.timedelta(days=14)
        prev_range_end = seven_days_ago

    signups_res = await db.execute(
        select(func.count(User.id)).where(User.created_at >= range_start)
    )
    new_signups = signups_res.scalar() or 0

    prev_signups_res = await db.execute(
        select(func.count(User.id)).where(
            User.created_at >= prev_range_start,
            User.created_at < prev_range_end,
        )
    )
    prev_signups = prev_signups_res.scalar() or 0

    def calc_delta(curr: float, prev: float) -> AdminDashboardMetricDelta:
        if prev == 0 and curr == 0:
            delta = 0.0
        elif prev == 0:
            delta = 100.0
        else:
            delta = round(((curr - prev) / prev) * 100, 1)
        return AdminDashboardMetricDelta(current=curr, previous=prev, delta_pct=delta)

    dau_delta = calc_delta(float(dau_count), 0.0)
    wau_delta = calc_delta(float(wau_count), 0.0)
    mau_delta = calc_delta(float(mau_count), 0.0)
    new_signups_delta = calc_delta(float(new_signups), float(prev_signups))

    summary_data = AdminDashboardSummary(
        period=range,
        registered_users=registered_users,
        registered_users_delta=new_signups_delta.delta_pct,
        active_dau=dau_count,
        active_dau_delta=dau_delta.delta_pct,
        active_wau=wau_count,
        active_wau_delta=wau_delta.delta_pct,
        active_mau=mau_count,
        active_mau_delta=mau_delta.delta_pct,
        new_signups=new_signups,
        new_signups_delta=new_signups_delta.delta_pct,
        paying_users=0,
        paying_users_delta=0.0,
        free_to_paid_conversion=0.0,
        free_to_paid_delta=0.0,
        revenue=0.0,
        revenue_delta=0.0,
        attempts_started=0,
        attempts_completed=0,
        attempts_delta=0.0,
        pending_reviews=0,
        failed_purchases=0,
        open_reports=suspended_count,
        dau=dau_delta,
        wau=wau_delta,
        mau=mau_delta,
    )

    try:
        await redis.set(cache_key, summary_data.model_dump_json(), ex=60)
    except Exception as e:
        logger.warning("Redis cache write failed: %s", e)

    return summary_data


@router.get("/timeseries", response_model=AdminTimeseriesData)
async def get_dashboard_timeseries(
    metric: str = Query(
        "signups", description="Metric type: signups, active_users, revenue"
    ),
    from_date: str | None = Query(None, alias="from"),
    to_date: str | None = Query(None, alias="to"),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminTimeseriesData:
    days = 14
    points: list[AdminTimeseriesPoint] = []
    now = utc_now()

    for i in range(days - 1, -1, -1):
        day_start = (now - datetime.timedelta(days=i)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        day_end = day_start + datetime.timedelta(days=1)
        day_str = day_start.strftime("%Y-%m-%d")

        sig_res = await db.execute(
            select(func.count(User.id)).where(
                User.created_at >= day_start, User.created_at < day_end
            )
        )
        sig_val = sig_res.scalar() or 0

        act_res = await db.execute(
            select(func.count(User.id)).where(
                User.last_seen_at >= day_start, User.last_seen_at < day_end
            )
        )
        act_val = act_res.scalar() or 0

        if metric == "signups":
            val = float(sig_val)
        elif metric == "active_users":
            val = float(act_val)
        else:  # revenue
            val = 0.0

        points.append(
            AdminTimeseriesPoint(
                date=day_str,
                signups=sig_val,
                active_users=act_val,
                revenue=0.0,
                value=val,
            )
        )

    return AdminTimeseriesData(metric=metric, points=points)


@router.get("/funnel", response_model=AdminFunnelData)
async def get_dashboard_funnel(
    range: str = Query("7d"),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminFunnelData:
    user_count_res = await db.execute(select(func.count(User.id)))
    signed_up_count = user_count_res.scalar() or 0

    steps = [
        AdminFunnelStep(
            name="Signed Up",
            step="Signed Up",
            count=signed_up_count,
            percentage=100.0 if signed_up_count > 0 else 0.0,
            conversion_rate_from_first=100.0 if signed_up_count > 0 else 0.0,
            dropoff_rate=0.0,
        ),
        AdminFunnelStep(
            name="Started Free Quiz",
            step="Started Free Quiz",
            count=0,
            percentage=0.0,
            conversion_rate_from_first=0.0,
            dropoff_rate=100.0 if signed_up_count > 0 else 0.0,
        ),
        AdminFunnelStep(
            name="Completed Quiz",
            step="Completed Quiz",
            count=0,
            percentage=0.0,
            conversion_rate_from_first=0.0,
            dropoff_rate=0.0,
        ),
        AdminFunnelStep(
            name="Purchased Quiz",
            step="Purchased Quiz",
            count=0,
            percentage=0.0,
            conversion_rate_from_first=0.0,
            dropoff_rate=0.0,
        ),
    ]
    return AdminFunnelData(steps=steps, overall_conversion_rate=0.0)


@router.get("/top-quizzes", response_model=list[AdminTopQuizItem])
async def get_top_quizzes(
    by: str = Query("revenue", description="Sort by: revenue, attempts"),
    limit: int = Query(5, ge=1, le=20),
    _admin: Admin = Depends(get_current_admin),
) -> list[AdminTopQuizItem]:
    return []


@router.get("/attention", response_model=AdminAttentionData)
async def get_dashboard_attention(
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminAttentionData:
    suspended_count_res = await db.execute(
        select(func.count(User.id)).where(User.status == "suspended")
    )
    suspended_count = suspended_count_res.scalar() or 0

    attention_items = []
    if suspended_count > 0:
        suffix = "s" if suspended_count > 1 else ""
        attention_items.append(
            AdminAttentionItem(
                id="att-suspended",
                type="user_report",
                severity="medium",
                title=f"{suspended_count} Suspended User Account{suffix}",
                description=(
                    "Accounts flagged and suspended pending admin investigation."
                ),
                link="/users?status=suspended",
                timestamp=utc_now().isoformat(),
            )
        )

    return AdminAttentionData(
        items=attention_items,
        pending_reviews=0,
        failed_purchases=0,
        suspended_accounts=suspended_count,
        reported_questions=0,
    )


@router.get("/recent-purchases", response_model=list[AdminRecentPurchase])
async def get_recent_purchases(
    limit: int = Query(10, ge=1, le=50),
    _admin: Admin = Depends(get_current_admin),
) -> list[AdminRecentPurchase]:
    return []


@router.get("/recent-signups", response_model=list[AdminRecentSignup])
async def get_recent_signups(
    limit: int = Query(10, ge=1, le=50),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[AdminRecentSignup]:
    res = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit))
    users = res.scalars().all()
    return [
        AdminRecentSignup(
            id=u.id,
            name=u.name,
            email=u.email or "",
            source="google" if u.source == "google" else "email",
            created_at=u.created_at.isoformat(),
        )
        for u in users
    ]


@router.get("/audit-activity", response_model=list[AdminAuditActivityItem])
@router.get("/recent-audit", response_model=list[AdminAuditActivityItem])
async def get_audit_activity(
    limit: int = Query(10, ge=1, le=50),
    _admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> list[AdminAuditActivityItem]:
    res = await db.execute(
        select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(limit)
    )
    logs = res.scalars().all()
    return [
        AdminAuditActivityItem(
            id=log.id,
            admin_name=log.attempted_email.split("@")[0].capitalize(),
            action=log.event_type,
            target_type="auth",
            target_id=log.admin_id or "system",
            details=log.details or log.status,
            timestamp=log.created_at.isoformat(),
        )
        for log in logs
    ]
