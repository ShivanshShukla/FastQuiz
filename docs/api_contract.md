# FastQuiz — API Contract & Specifications

_Living doc. Defines the REST API endpoints, schemas, authentication, and WebSocket communication across FastQuiz services._

---

## 1. Global Conventions

- **Base URL**: Routed via API Gateway in production (e.g. `https://api.fastquiz.dev/v1/`). In local development:
  - Auth Service: `http://localhost:8001`
  - Quiz Service: `http://localhost:8002`
  - Payments Service: `http://localhost:8003`
- **Authentication**: Bearer Token in `Authorization: Bearer <access_token>` header.
- **Content-Type**: `application/json` for all requests and responses.
- **Error Response Format**:
  ```json
  {
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "The requested quiz was not found.",
    "details": null
  }
  ```

---

## 2. Auth Service (`/auth`)

### 2.1 Register

- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "name": "Jane Doe"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "user": {
      "id": "c1f7a77b-6c41-4e4b-84a2-5b1285223ab9",
      "email": "user@example.com",
      "name": "Jane Doe",
      "created_at": "2026-09-27T12:00:00Z"
    },
    "tokens": {
      "access_token": "jwt.token.here",
      "refresh_token": "refresh.token.here",
      "token_type": "bearer",
      "expires_in": 3600
    }
  }
  ```

### 2.2 Login

- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response**: `200 OK` (Same payload as Register)

### 2.3 Refresh Token

- **Endpoint**: `POST /auth/refresh`
- **Request Body**:
  ```json
  {
    "refresh_token": "refresh.token.here"
  }
  ```
- **Response**: `200 OK` (New access token and refresh token)

### 2.4 Get Current User Profile

- **Endpoint**: `GET /auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK`
  ```json
  {
    "id": "c1f7a77b-6c41-4e4b-84a2-5b1285223ab9",
    "email": "user@example.com",
    "name": "Jane Doe",
    "created_at": "2026-09-27T12:00:00Z"
  }
  ```

---

## 3. Quiz Service (`/quiz`)

### 3.1 List Topics

- **Endpoint**: `GET /topics`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "713e2f54-d8bc-4676-9284-486016c68a4e",
      "name": "Arrays & Strings",
      "description": "Essential coding interview patterns for arrays and string manipulations.",
      "total_quizzes": 5,
      "free_attempt_available": true
    }
  ]
  ```

### 3.2 List Quizzes for Topic

- **Endpoint**: `GET /quizzes?topic_id=<uuid>`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "23d88196-857c-4739-9d7a-11ce51db4d68",
      "topic_id": "713e2f54-d8bc-4676-9284-486016c68a4e",
      "title": "Two-Pointer Technique Quiz",
      "description": "Test your mastery of two-pointer problems.",
      "price": 4.99,
      "question_count": 10,
      "is_purchased": false
    }
  ]
  ```

### 3.3 Get Quiz Details & Questions (Taking Quiz)

- **Endpoint**: `GET /quizzes/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `200 OK`
  ```json
  {
    "id": "23d88196-857c-4739-9d7a-11ce51db4d68",
    "topic_id": "713e2f54-d8bc-4676-9284-486016c68a4e",
    "title": "Two-Pointer Technique Quiz",
    "price": 4.99,
    "questions": [
      {
        "id": "f8a0027b-2321-4dcb-b208-8f85f3bc7a1a",
        "text": "What is the optimal time complexity to reverse an array in-place using two pointers?",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        "order": 1
      }
    ]
  }
  ```
  _(Note: `correct_option_index` and `explanation` are redacted during quiz taking)_

### 3.4 Start Quiz Attempt

- **Endpoint**: `POST /quizzes/:id/start`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `201 Created`
  ```json
  {
    "attempt_id": "a931e5f8-b391-4cf1-a477-84bc74d852a4",
    "quiz_id": "23d88196-857c-4739-9d7a-11ce51db4d68",
    "is_free_attempt": true,
    "duration_seconds": 900,
    "started_at": "2026-09-27T12:30:00Z"
  }
  ```

### 3.5 Submit Quiz Attempt

- **Endpoint**: `POST /attempts/:id/submit`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "answers": {
      "f8a0027b-2321-4dcb-b208-8f85f3bc7a1a": 2
    }
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "attempt_id": "a931e5f8-b391-4cf1-a477-84bc74d852a4",
    "score": 100,
    "total_questions": 1,
    "explanations_unlocked": true,
    "results": [
      {
        "question_id": "f8a0027b-2321-4dcb-b208-8f85f3bc7a1a",
        "selected_option_index": 2,
        "correct_option_index": 2,
        "is_correct": true,
        "explanation": "Two pointers traversing inwards from both ends require n/2 operations, giving O(n) runtime."
      }
    ]
  }
  ```

### 3.6 WebSocket Timer Connection

- **Endpoint**: `ws://localhost:8002/ws/attempts/:id/timer?token=<access_token>`
- **Server Pushes**:
  - `{"type": "tick", "remaining_seconds": 845}`
  - `{"type": "expired", "message": "Time is up. Attempt auto-submitted."}`

### 3.7 Admin Questions Review Queue

- **Endpoint**: `GET /admin/questions?status=pending`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response**: `200 OK` list of questions pending moderation.
- **Endpoint**: `PATCH /admin/questions/:id/review`
- **Request Body**:
  ```json
  {
    "status": "approved",
    "feedback": "Clear explanation and high quality MCQ options."
  }
  ```

---

## 4. Payments Service (`/payments`)

### 4.1 Create Quiz Checkout Session

- **Endpoint**: `POST /purchases/quiz/:quiz_id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `201 Created`
  ```json
  {
    "purchase_id": "4e758a69-6dc9-47aa-8526-9d3b313ef010",
    "amount": 4.99,
    "currency": "USD",
    "checkout_url": "https://payment-provider.com/pay/session_xyz"
  }
  ```

### 4.2 Create Bundle Checkout Session

- **Endpoint**: `POST /purchases/bundle/:bundle_id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `201 Created` (Returns checkout session for bundle)

### 4.3 Webhook Handling

- **Endpoint**: `POST /webhooks/payment`
- **Headers**: `X-Webhook-Signature: <signature>`
- **Response**: `200 OK` `{"received": true}`
- **Side Effect**: Marks `Purchase` as `completed`, publishes `payment.completed` to RabbitMQ.

---

## 5. Error Code Reference

| Error Code               | HTTP Status | Description                                         |
| ------------------------ | ----------- | --------------------------------------------------- |
| `UNAUTHORIZED`           | 401         | Missing or invalid authentication token             |
| `FORBIDDEN`              | 403         | User does not have access or has not purchased quiz |
| `NOT_FOUND`              | 404         | Topic, Quiz, Question, or Attempt not found         |
| `FREE_ATTEMPT_EXHAUSTED` | 400         | Free attempt for this topic has already been used   |
| `ATTEMPT_EXPIRED`        | 400         | Quiz time limit has expired                         |
| `PAYMENT_FAILED`         | 400         | Payment could not be processed                      |
| `INTERNAL_SERVER_ERROR`  | 500         | Unhandled server error                              |
