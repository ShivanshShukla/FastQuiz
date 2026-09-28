from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_admin
from app.schemas.admin import (
    AdminQuestionItem,
    AdminQuizItem,
    AdminReviewActionResponse,
    Question,
    RejectQuestionRequest,
    TopicSummary,
)

router = APIRouter(prefix="/admin", tags=["Admin Quiz & Editorial Workbench"])

# Initial in-memory topic and quiz syllabus catalogue
TOPICS: list[dict[str, Any]] = [
    {
        "id": "topic-dsa-1",
        "name": "Arrays & Two Pointers",
        "description": "Sliding windows, in-place manipulation, two-pointer paradigms.",
        "total_quizzes": 4,
        "free_attempt_available": True,
    },
    {
        "id": "topic-sys-2",
        "name": "System Design Fundamentals",
        "description": "Load balancing, replication, CAP theorem, distributed cache.",
        "total_quizzes": 5,
        "free_attempt_available": True,
    },
    {
        "id": "topic-os-3",
        "name": "Concurrency & OS Concepts",
        "description": "Deadlocks, mutexes, virtual memory, thread scheduling.",
        "total_quizzes": 3,
        "free_attempt_available": True,
    },
]

QUIZZES: list[dict[str, Any]] = [
    {
        "id": "quiz-two-pointer",
        "topic_id": "topic-dsa-1",
        "topic_name": "Arrays & Two Pointers",
        "title": "Two-Pointer Technique Quiz",
        "description": "Master fast and slow pointers, container with most water.",
        "price": 4.99,
        "question_ids": ["q-mod-1", "q-mod-2"],
        "total_questions": 10,
        "approved_questions_count": 8,
        "pending_questions_count": 2,
        "created_at": "2026-09-20T10:00:00Z",
    },
    {
        "id": "quiz-sliding-window",
        "topic_id": "topic-dsa-1",
        "topic_name": "Arrays & Two Pointers",
        "title": "Sliding Window Mastery",
        "description": "Fixed and dynamic window interview patterns.",
        "price": 3.99,
        "question_ids": ["q-mod-3"],
        "total_questions": 8,
        "approved_questions_count": 7,
        "pending_questions_count": 1,
        "created_at": "2026-09-21T14:30:00Z",
    },
    {
        "id": "quiz-cache-design",
        "topic_id": "topic-sys-2",
        "topic_name": "System Design Fundamentals",
        "title": "Distributed Caching (Redis & Memcached)",
        "description": "Eviction policies, cache-aside, write-through.",
        "price": 5.99,
        "question_ids": ["q-mod-4", "q-mod-5"],
        "total_questions": 12,
        "approved_questions_count": 10,
        "pending_questions_count": 2,
        "created_at": "2026-09-22T09:15:00Z",
    },
]

# In-memory question repository for moderation pipeline
QUESTIONS_DB: dict[str, dict[str, Any]] = {
    "q-mod-1": {
        "id": "q-mod-1",
        "quiz_id": "quiz-two-pointer",
        "topic_id": "topic-dsa-1",
        "topic_name": "Arrays & Two Pointers",
        "quiz_title": "Two-Pointer Technique Quiz",
        "text": "What is the minimum time complexity to determine if an array with N elements contains a pair that sums to target K when the array is already sorted?",
        "options": ["O(N^2)", "O(N log N)", "O(N)", "O(1)"],
        "correct_option_index": 2,
        "explanation": "Using two pointers starting at opposite ends of the sorted array, each step moves either the left or right pointer, inspecting at most N elements.",
        "source_type": "ai_generated",
        "review_status": "pending",
        "order": 1,
        "submitter_email": "gemini-model-generator@fastquiz.internal",
        "submitted_at": "2026-09-27T08:30:00Z",
    },
    "q-mod-2": {
        "id": "q-mod-2",
        "quiz_id": "quiz-two-pointer",
        "topic_id": "topic-dsa-1",
        "topic_name": "Arrays & Two Pointers",
        "quiz_title": "Two-Pointer Technique Quiz",
        "text": "In the Maximum Sum Subarray problem with fixed window size K, what is the best space complexity possible without modifying input?",
        "options": ["O(K)", "O(N)", "O(1)", "O(log K)"],
        "correct_option_index": 2,
        "explanation": "We only need to track the current window sum and max sum variables, requiring strictly O(1) auxiliary memory.",
        "source_type": "community",
        "review_status": "pending",
        "order": 2,
        "submitter_email": "alex.engineer@gmail.com",
        "submitted_at": "2026-09-27T11:15:00Z",
    },
    "q-mod-3": {
        "id": "q-mod-3",
        "quiz_id": "quiz-sliding-window",
        "topic_id": "topic-dsa-1",
        "topic_name": "Arrays & Two Pointers",
        "quiz_title": "Sliding Window Mastery",
        "text": "Which condition triggers moving the left pointer in a variable-size sliding window search for the longest substring without repeating characters?",
        "options": [
            "Current character frequency exceeds 1 in the frequency map",
            "Right pointer reaches the end of the string",
            "The window size exceeds half of string length",
            "A vowel character is encountered",
        ],
        "correct_option_index": 0,
        "explanation": "When duplicate frequency > 1 is detected, the left pointer advances to shrink the window until the invariant (zero duplicates) is restored.",
        "source_type": "self_authored",
        "review_status": "pending",
        "order": 1,
        "submitter_email": "senior.curator@fastquiz.dev",
        "submitted_at": "2026-09-27T13:40:00Z",
    },
    "q-mod-4": {
        "id": "q-mod-4",
        "quiz_id": "quiz-cache-design",
        "topic_id": "topic-sys-2",
        "topic_name": "System Design Fundamentals",
        "quiz_title": "Distributed Caching (Redis & Memcached)",
        "text": "What is the primary architectural vulnerability addressed by applying Cache Stampede protection (e.g. probabilistic early expiration / mutex locking)?",
        "options": [
            "Massive sudden traffic spike hitting the primary database upon key expiration",
            "Memory fragmentation within the Redis heap cluster",
            "Slow disk I/O when writing AOF persistence logs",
            "Packet loss across availability zone cross-connections",
        ],
        "correct_option_index": 0,
        "explanation": "Cache stampede happens when a popular key expires and simultaneous requests concurrently hammer the DB to regenerate it.",
        "source_type": "ai_generated",
        "review_status": "pending",
        "order": 1,
        "submitter_email": "claude-content-curator@fastquiz.internal",
        "submitted_at": "2026-09-27T15:20:00Z",
    },
    "q-mod-5": {
        "id": "q-mod-5",
        "quiz_id": "quiz-cache-design",
        "topic_id": "topic-sys-2",
        "topic_name": "System Design Fundamentals",
        "quiz_title": "Distributed Caching (Redis & Memcached)",
        "text": "In a Write-Through caching architecture, in which order are the cache and storage layers written?",
        "options": [
            "Cache and storage are written synchronously together before returning success",
            "Storage is written first, cache is asynchronously updated in background",
            "Cache is written first, dirty pages flushed to storage periodically",
            "Cache is only written upon cache miss during read operations",
        ],
        "correct_option_index": 0,
        "explanation": "Write-Through updates both cache and backing database synchronously, guaranteeing cache consistency at the expense of higher write latency.",
        "source_type": "self_authored",
        "review_status": "pending",
        "order": 2,
        "submitter_email": "editorial.staff@fastquiz.dev",
        "submitted_at": "2026-09-27T16:00:00Z",
    },
}


@router.get("/topics", response_model=list[TopicSummary])
async def list_admin_topics(
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> list[TopicSummary]:
    """Returns all topics for curriculum browsing."""
    return [TopicSummary(**t) for t in TOPICS]


@router.get("/topics/{topic_id}/quizzes", response_model=list[AdminQuizItem])
async def list_quizzes_for_topic(
    topic_id: str,
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> list[AdminQuizItem]:
    """Returns all quizzes within a specific curriculum topic."""
    matched = [q for q in QUIZZES if q["topic_id"] == topic_id]
    return [AdminQuizItem(**q) for q in matched]


@router.get("/quizzes/{quiz_id}/questions", response_model=list[Question])
async def list_questions_for_quiz(
    quiz_id: str,
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> list[Question]:
    """Returns question stems for a quiz."""
    matched = [q for q in QUESTIONS_DB.values() if q.get("quiz_id") == quiz_id]
    return [Question(**q) for q in matched]


@router.get("/questions", response_model=list[AdminQuestionItem])
async def list_admin_questions(
    status: str = Query("pending", description="Filter by review status: pending, approved, rejected, or all"),
    topic_id: str | None = Query(None, description="Optional topic filter"),
    source_type: str | None = Query(None, description="Optional source type filter"),
    search: str | None = Query(None, description="Optional search term"),
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> list[AdminQuestionItem]:
    """Returns the question moderation queue matching current filters."""
    result: list[dict[str, Any]] = list(QUESTIONS_DB.values())

    if status != "all":
        result = [q for q in result if q.get("review_status") == status]

    if topic_id and topic_id != "all":
        result = [q for q in result if q.get("topic_id") == topic_id]

    if source_type and source_type != "all":
        result = [q for q in result if q.get("source_type") == source_type]

    if search and search.strip():
        term = search.strip().lower()
        result = [
            q for q in result
            if term in q.get("text", "").lower()
            or term in q.get("explanation", "").lower()
            or term in q.get("quiz_title", "").lower()
        ]

    return [AdminQuestionItem(**q) for q in result]


@router.get("/questions/{question_id}", response_model=AdminQuestionItem)
async def get_admin_question(
    question_id: str,
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> AdminQuestionItem:
    """Returns full question details for inspection."""
    question = QUESTIONS_DB.get(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{question_id}' not found",
        )
    return AdminQuestionItem(**question)


@router.post("/questions/{question_id}/approve", response_model=AdminReviewActionResponse)
async def approve_question(
    question_id: str,
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> AdminReviewActionResponse:
    """Approves a question into the production candidate pool."""
    question = QUESTIONS_DB.get(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{question_id}' not found",
        )
    question["review_status"] = "approved"
    return AdminReviewActionResponse(
        success=True,
        status="approved",
        question_id=question_id,
    )


@router.post("/questions/{question_id}/reject", response_model=AdminReviewActionResponse)
async def reject_question(
    question_id: str,
    payload: RejectQuestionRequest,
    _admin: dict[str, Any] = Depends(get_current_admin),
) -> AdminReviewActionResponse:
    """Rejects a question with feedback for the submitter/pipeline."""
    question = QUESTIONS_DB.get(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{question_id}' not found",
        )
    question["review_status"] = "rejected"
    question["reject_reason"] = payload.reason
    return AdminReviewActionResponse(
        success=True,
        status="rejected",
        question_id=question_id,
        reason=payload.reason,
    )
