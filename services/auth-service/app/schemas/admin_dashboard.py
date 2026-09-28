from typing import Literal
from pydantic import BaseModel


class AdminDashboardMetricDelta(BaseModel):
    current: float
    previous: float
    delta_pct: float


class AdminDashboardSummary(BaseModel):
    period: str
    registered_users: int = 0
    registered_users_delta: float = 0.0
    active_dau: int = 0
    active_dau_delta: float = 0.0
    active_wau: int = 0
    active_wau_delta: float = 0.0
    active_mau: int = 0
    active_mau_delta: float = 0.0
    new_signups: int = 0
    new_signups_delta: float = 0.0
    paying_users: int = 0
    paying_users_delta: float = 0.0
    free_to_paid_conversion: float = 0.0
    free_to_paid_delta: float = 0.0
    revenue: float = 0.0
    revenue_delta: float = 0.0
    attempts_started: int = 0
    attempts_completed: int = 0
    attempts_delta: float = 0.0
    pending_reviews: int = 0
    failed_purchases: int = 0
    open_reports: int = 0

    # Backwards compatibility fields for tests
    dau: AdminDashboardMetricDelta | None = None
    wau: AdminDashboardMetricDelta | None = None
    mau: AdminDashboardMetricDelta | None = None


class AdminTimeseriesPoint(BaseModel):
    date: str
    signups: int = 0
    active_users: int = 0
    revenue: float = 0.0
    value: float = 0.0


class AdminTimeseriesData(BaseModel):
    metric: str
    points: list[AdminTimeseriesPoint] = []


class AdminFunnelStep(BaseModel):
    name: str
    count: int
    percentage: float = 0.0
    step: str | None = None
    conversion_rate_from_first: float = 0.0
    dropoff_rate: float = 0.0


class AdminFunnelData(BaseModel):
    steps: list[AdminFunnelStep] = []
    overall_conversion_rate: float = 0.0


class AdminTopQuizItem(BaseModel):
    id: str
    title: str
    topic_name: str
    revenue: float = 0.0
    attempts: int = 0
    completion_rate: float = 0.0
    quiz_id: str | None = None
    attempts_count: int | None = None


class AdminAttentionItem(BaseModel):
    id: str
    type: Literal["pending_review", "failed_purchase", "user_report", "stuck_attempt"]
    severity: Literal["high", "medium", "low"]
    title: str
    description: str
    link: str
    timestamp: str


class AdminAttentionData(BaseModel):
    items: list[AdminAttentionItem] = []
    pending_reviews: int = 0
    failed_purchases: int = 0
    suspended_accounts: int = 0
    reported_questions: int = 0


class AdminRecentPurchase(BaseModel):
    id: str
    user_email: str
    item_title: str
    amount: float
    status: Literal["completed", "pending", "failed", "refunded"]
    created_at: str


class AdminRecentSignup(BaseModel):
    id: str
    name: str
    email: str
    source: Literal["email", "google"]
    created_at: str


class AdminAuditActivityItem(BaseModel):
    id: str
    admin_name: str
    action: str
    target_type: str
    target_id: str
    details: str
    timestamp: str
