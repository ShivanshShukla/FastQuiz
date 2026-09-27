# FastQuiz — Tech Stack Decision

*Living doc. Pairs with the Data Model and API Contract docs.*

## Backend
- **Framework**: FastAPI (Python)
- **API style**: REST (per API Contract doc)
- **Auth**: JWT (access + refresh tokens) + Google OAuth

## Databases
- **PostgreSQL**: core transactional data — Users, Quizzes, Attempts, Purchases (needs strong consistency for payments)
- **MongoDB**: flexible content — Questions, especially AI-generated/community-submitted ones where schema may evolve (e.g. future question types beyond MCQ)
- **Redis**: session/token caching, rate limiting on auth endpoints

## Frontend (Web)
- **React + TypeScript** — matches existing experience, pairs naturally with a React Native mobile app (shared logic/patterns, some component libraries portable)

## Mobile
- **React Native** — single codebase for iOS + Android, shares data-fetching/API logic with the web client more easily than a fully separate native stack

## Infrastructure
- **Cloud**: **AWS** (recommended) — broadest managed-service coverage for this stack:
  - **ECS Fargate** (or EC2) — FastAPI backend
  - **RDS (PostgreSQL)** — core data
  - **MongoDB Atlas** (on AWS) or **DocumentDB** — content store (Atlas recommended: easier ops, native Mongo compatibility)
  - **ElastiCache (Redis)** — caching/sessions
  - **S3 + CloudFront** — web app hosting
- **Containers**: Docker for backend; Kubernetes/k3s optional later if scale demands it (not needed for v1)
- **CI/CD**: GitHub Actions — lint/test/build on PR, deploy on merge to main

## Payments
- **TBD** — Razorpay likely (India-based), pending decision (see PRD open questions)

## Summary Table
| Layer | Choice |
|---|---|
| Backend | FastAPI |
| Web frontend | React + TypeScript |
| Mobile | React Native |
| Relational DB | PostgreSQL (AWS RDS) |
| Document DB | MongoDB (Atlas) |
| Cache | Redis (ElastiCache) |
| Cloud | AWS |
| CI/CD | GitHub Actions |
| Containers | Docker |