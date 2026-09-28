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


def test_unauthenticated_request_rejected():
    res = client.get("/admin/topics")
    assert res.status_code == 401
    assert "Missing administrative authorization token" in res.json()["detail"]


def test_invalid_audience_rejected():
    payload = {
        "sub": "usr-1",
        "email": "user@example.com",
        "aud": "fastquiz-learners",
        "iss": "fastquiz-auth-service",
    }
    token = jwt.encode(
        payload, settings.ADMIN_JWT_SECRET, algorithm=settings.JWT_ALGORITHM
    )
    res = client.get("/admin/topics", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401


def test_list_topics_success():
    token = make_admin_token()
    res = client.get("/admin/topics", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    assert any(t["id"] == "topic-dsa-1" for t in data)


def test_list_pending_questions_and_filters():
    token = make_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/admin/questions?status=pending", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # Filter by topic
    res_topic = client.get(
        "/admin/questions?status=pending&topic_id=topic-dsa-1",
        headers=headers,
    )
    assert res_topic.status_code == 200
    assert all(q["topic_id"] == "topic-dsa-1" for q in res_topic.json())


def test_get_single_question():
    token = make_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/admin/questions/q-mod-1", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "q-mod-1"
    assert "options" in data


def test_approve_question():
    token = make_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/admin/questions/q-mod-1/approve", headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "approved"
    assert res.json()["question_id"] == "q-mod-1"

    # Verify updated in question detail
    detail = client.get("/admin/questions/q-mod-1", headers=headers)
    assert detail.json()["review_status"] == "approved"


def test_reject_question_with_reason():
    token = make_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post(
        "/admin/questions/q-mod-2/reject",
        json={"reason": "Ambiguous option C wording"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"
    assert res.json()["reason"] == "Ambiguous option C wording"

    # Verify updated in question detail
    detail = client.get("/admin/questions/q-mod-2", headers=headers)
    assert detail.json()["review_status"] == "rejected"
    assert detail.json()["reject_reason"] == "Ambiguous option C wording"


def test_topic_quizzes_and_quiz_questions():
    token = make_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res_quizzes = client.get(
        "/admin/topics/topic-dsa-1/quizzes",
        headers=headers,
    )
    assert res_quizzes.status_code == 200
    assert len(res_quizzes.json()) >= 2

    res_questions = client.get(
        "/admin/quizzes/quiz-two-pointer/questions",
        headers=headers,
    )
    assert res_questions.status_code == 200
    assert isinstance(res_questions.json(), list)
