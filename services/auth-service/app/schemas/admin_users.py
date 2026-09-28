from typing import Literal
from pydantic import BaseModel, Field


class AdminUsersSummaryChips(BaseModel):
    total_registered: int
    active_30d: int
    suspended: int
    paying_customers: int


class AdminUserListItem(BaseModel):
    id: str
    name: str
    email: str
    status: Literal["active", "suspended"]
    source: Literal["email", "google"]
    created_at: str
    last_seen_at: str | None = None
    quizzes_purchased: int = 0
    total_spent: float = 0.0
    attempts_count: int = 0


class AdminUsersListResponse(BaseModel):
    items: list[AdminUserListItem]
    total: int
    page: int
    page_size: int
    summary: AdminUsersSummaryChips


class AdminUserAttemptItem(BaseModel):
    id: str
    quiz_id: str
    quiz_title: str
    score: int
    is_free_attempt: bool
    explanations_unlocked: bool
    completed_at: str


class AdminUserPurchaseItem(BaseModel):
    id: str
    item_title: str
    amount: float
    status: Literal["completed", "pending", "failed", "refunded"]
    payment_provider_ref: str
    created_at: str


class AdminUserFreeGrantItem(BaseModel):
    topic_id: str
    topic_name: str
    status: Literal["available", "used"]
    used_at: str | None = None


class AdminUserActivityItem(BaseModel):
    id: str
    activity_type: Literal[
        "signup", "login", "quiz_start", "quiz_complete", "purchase", "admin_action"
    ]
    description: str
    timestamp: str


class AdminUserNoteItem(BaseModel):
    id: str
    user_id: str
    admin_id: str
    admin_name: str
    admin_role: str
    text: str
    created_at: str


class AdminUserDetail(BaseModel):
    id: str
    name: str
    email: str
    status: Literal["active", "suspended"]
    source: Literal["email", "google"]
    created_at: str
    last_seen_at: str | None = None
    attempts_count: int = 0
    avg_score_pct: float = 0.0
    quizzes_purchased: int = 0
    total_spent: float = 0.0
    attempts: list[AdminUserAttemptItem] = Field(default_factory=list)
    purchases: list[AdminUserPurchaseItem] = Field(default_factory=list)
    free_grants: list[AdminUserFreeGrantItem] = Field(default_factory=list)
    activity: list[AdminUserActivityItem] = Field(default_factory=list)
    notes: list[AdminUserNoteItem] = Field(default_factory=list)


class SuspendUserRequest(BaseModel):
    reason: str = Field(min_length=3)


class UnsuspendUserRequest(BaseModel):
    reason: str = Field(min_length=3)


class GrantQuizRequest(BaseModel):
    quiz_id: str = Field(min_length=1)
    reason: str = Field(min_length=3)


class ResetFreeGrantRequest(BaseModel):
    reason: str = Field(min_length=3)


class CreateAdminNoteRequest(BaseModel):
    text: str = Field(min_length=1)


class AdminActionResponse(BaseModel):
    success: bool
    message: str


class AdminUserQuestionBreakdown(BaseModel):
    question_id: str
    prompt: str
    options: list[str]
    user_answer_index: int
    correct_answer_index: int
    is_correct: bool
    explanation: str
