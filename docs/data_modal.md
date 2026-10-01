# FastQuiz — Data Model

_Living doc. Feed this + the API contract to coding agents together — they define the same entities._

## Entities

### User

| Field         | Type             | Notes                         |
| ------------- | ---------------- | ----------------------------- |
| id            | UUID             | PK                            |
| name          | string           |                               |
| email         | string           | unique                        |
| password_hash | string, nullable | null if Google-only signup    |
| google_id     | string, nullable | null if email/password signup |
| created_at    | timestamp        |                               |

### Topic

| Field       | Type   | Notes                                           |
| ----------- | ------ | ----------------------------------------------- |
| id          | UUID   | PK                                              |
| name        | string | e.g. "Arrays & Strings", "System Design Basics" |
| description | string |                                                 |

### Quiz

| Field        | Type      | Notes                                           |
| ------------ | --------- | ----------------------------------------------- |
| id           | UUID      | PK                                              |
| topic_id     | UUID      | FK → Topic                                      |
| title        | string    |                                                 |
| description  | string    |                                                 |
| price        | decimal   |                                                 |
| question_ids | UUID[]    | fixed, ordered set — not randomized per attempt |
| created_at   | timestamp |                                                 |

### Question

| Field                | Type     | Notes                                                         |
| -------------------- | -------- | ------------------------------------------------------------- |
| id                   | UUID     | PK                                                            |
| quiz_id              | UUID     | FK → Quiz                                                     |
| text                 | string   |                                                               |
| options              | string[] | MCQ options                                                   |
| correct_option_index | int      |                                                               |
| explanation          | string   | locked from user until quiz is purchased                      |
| source_type          | enum     | `self_authored` \| `community` \| `ai_generated`              |
| review_status        | enum     | `pending` \| `approved` \| `rejected` — gate before it's live |
| order                | int      |                                                               |

### Bundle

| Field    | Type    | Notes                                        |
| -------- | ------- | -------------------------------------------- |
| id       | UUID    | PK                                           |
| topic_id | UUID    | FK → Topic                                   |
| quiz_ids | UUID[]  | quizzes included                             |
| price    | decimal | discounted vs. sum of individual quiz prices |

### FreeAttemptGrant

| Field    | Type      | Notes                                   |
| -------- | --------- | --------------------------------------- |
| id       | UUID      | PK                                      |
| user_id  | UUID      | FK → User                               |
| topic_id | UUID      | FK → Topic                              |
| used_at  | timestamp | enforces "one free quiz per topic" rule |

### Attempt

| Field                     | Type      | Notes                                  |
| ------------------------- | --------- | -------------------------------------- |
| id                        | UUID      | PK                                     |
| user_id                   | UUID      | FK → User                              |
| quiz_id                   | UUID      | FK → Quiz                              |
| answers                   | JSON      | `{question_id: selected_option_index}` |
| score                     | int       |                                        |
| is_free_attempt           | bool      | true if used the topic's free grant    |
| explanations_unlocked     | bool      | true if quiz purchased                 |
| started_at / completed_at | timestamp |                                        |

### Purchase

| Field                | Type           | Notes                                              |
| -------------------- | -------------- | -------------------------------------------------- |
| id                   | UUID           | PK                                                 |
| user_id              | UUID           | FK → User                                          |
| quiz_id              | UUID, nullable | set if single-quiz purchase                        |
| bundle_id            | UUID, nullable | set if bundle purchase                             |
| amount               | decimal        |                                                    |
| payment_provider_ref | string         | external transaction ID                            |
| status               | enum           | `pending` \| `completed` \| `failed` \| `refunded` |
| created_at           | timestamp      |                                                    |

## Relationships

- Topic 1—N Quiz
- Quiz 1—N Question (fixed set)
- Topic 1—N Bundle, Bundle N—N Quiz
- User 1—N Attempt, User 1—N Purchase
- User 1—1 FreeAttemptGrant per Topic

## Open Questions

- Does a Bundle purchase unlock all quizzes in it permanently, same as individual purchase?
- Should `Attempt` history be visible to the user indefinitely, or capped?
