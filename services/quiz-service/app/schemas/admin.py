from typing import Literal

from pydantic import BaseModel, Field


class TopicSummary(BaseModel):
    id: str
    name: str
    description: str
    total_quizzes: int = 0
    free_attempt_available: bool = True


class Question(BaseModel):
    id: str
    quiz_id: str
    text: str
    options: list[str]
    correct_option_index: int
    explanation: str
    source_type: Literal["self_authored", "community", "ai_generated"] = "ai_generated"
    review_status: Literal["pending", "approved", "rejected"] = "pending"
    order: int = 1


class AdminQuestionItem(Question):
    topic_id: str | None = None
    topic_name: str | None = None
    quiz_title: str | None = None
    submitter_email: str | None = None
    submitted_at: str | None = None
    reject_reason: str | None = None


class AdminQuizItem(BaseModel):
    id: str
    topic_id: str
    topic_name: str | None = None
    title: str
    description: str
    price: float = 0.0
    question_ids: list[str] = Field(default_factory=list)
    total_questions: int = 0
    approved_questions_count: int = 0
    pending_questions_count: int = 0
    created_at: str = "2026-09-20T10:00:00Z"


class RejectQuestionRequest(BaseModel):
    reason: str


class AdminReviewActionResponse(BaseModel):
    success: bool
    status: Literal["approved", "rejected"]
    question_id: str
    reason: str | None = None
