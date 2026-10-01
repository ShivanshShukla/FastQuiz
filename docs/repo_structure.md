# FastQuiz — Repo & Folder Structure

_Living doc. Point every coding-agent session at this so files land in consistent places._

## Monorepo Tooling

**Turborepo** for the JS side — simpler setup than Nx for a solo project, good build caching, works cleanly with npm/pnpm workspaces. Python services are managed independently (each with its own `pyproject.toml`), orchestrated locally via `docker-compose`.

## Top-Level Layout

```
fastquiz/
├── apps/
│   ├── web/                # React + TypeScript — main user-facing web app
│   ├── mobile/              # React Native — iOS + Android
│   └── admin/                # React + TypeScript — content review app
├── packages/
│   └── shared/                # shared TS types, API client, constants — used by web, mobile, admin
├── services/
│   ├── auth-service/          # FastAPI
│   ├── quiz-service/          # FastAPI
│   └── payments-service/      # FastAPI
├── gateway/                   # API Gateway config (or thin FastAPI/Kong gateway)
├── infra/
│   ├── docker-compose.yml     # local dev: all services + Postgres + Mongo + Redis + RabbitMQ
│   └── (terraform/ or cdk/ — added later for real AWS deploy)
├── docs/                      # PRD, data model, API contract, tech stack, architecture — all the docs so far
├── .github/
│   └── workflows/             # one pipeline per service/app
├── turbo.json
├── package.json                # root — npm/pnpm workspaces config
└── README.md
```

## Inside Each Python Service (e.g. `services/quiz-service/`)

```
quiz-service/
├── app/
│   ├── main.py
│   ├── models/                 # Postgres (SQLAlchemy) + Mongo (Beanie/Motor) models
│   ├── routers/                # one file per resource: quizzes.py, attempts.py, etc.
│   ├── schemas/                # Pydantic request/response models
│   ├── core/                   # config, security, DB connections
│   └── events/                 # RabbitMQ publishers/consumers
├── tests/
├── Dockerfile
├── pyproject.toml
└── .env.example
```

## Inside Each JS App (e.g. `apps/web/`)

```
web/
├── src/
│   ├── pages/ (or routes/)
│   ├── components/
│   ├── hooks/
│   └── lib/                    # imports from packages/shared
├── package.json                 # depends on "shared": "workspace:*"
├── tsconfig.json
└── Dockerfile (web only — mobile builds differently)
```

## `packages/shared/` Contents

- API client (typed fetch wrappers matching the REST API Contract doc)
- TypeScript types mirroring the Data Model doc's entities
- Shared constants (e.g. free-attempt rules, quiz states)

## Conventions

- Every service/app owns its own Dockerfile and `.env.example`
- Docs in `docs/` are the source of truth — code should match them, not the other way around; update the doc first when a decision changes
- GitHub Actions: one workflow per service/app, triggered by path filters (only rebuild what changed)

## Open Questions

- npm or pnpm for JS workspaces? (pnpm is generally faster/more disk-efficient for monorepos — recommend pnpm unless you have a reason not to)
