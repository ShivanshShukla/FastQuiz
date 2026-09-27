# FastQuiz ⚡

FastQuiz is a modern, modular quiz and exam preparation platform designed to help users prepare for technical and specialized interviews. It replaces rigid annual subscriptions with a flexible, pay-as-you-need freemium model.

---

## Monorepo Architecture

The repository is organized as a Turborepo monorepo with npm workspaces for JavaScript/TypeScript, paired with independent Python FastAPI microservices and Dockerized local infrastructure.

```
fastquiz/
├── apps/
│   ├── web/                # React + Vite + TypeScript (Main user web client)
│   ├── admin/              # React + Vite + TypeScript (Content review web client)
│   └── mobile/             # React Native (Expo) + TypeScript (iOS & Android)
├── packages/
│   └── shared/             # TypeScript API client, models, and shared constants
├── services/
│   ├── auth-service/       # FastAPI (JWT auth, users, sessions)
│   ├── quiz-service/       # FastAPI (quizzes, questions, attempts, timer WS)
│   └── payments-service/   # FastAPI (purchases, bundles, payment webhooks)
├── infra/
│   └── docker-compose.yml  # Local infra (Postgres, MongoDB, Redis, RabbitMQ, + services)
├── docs/                   # Product & engineering specifications
└── .github/workflows/      # Path-filtered CI pipelines per app/service
```

---

## Prerequisites

- **Node.js**: `v18+` (v20+ recommended) & `npm`
- **Python**: `3.11+`
- **Docker & Docker Compose**: For running local databases and services

---

## Quick Start

### 1. Install JS Dependencies
```bash
npm install
```

### 2. Build Shared Library & JS Apps
```bash
npm run build
```

### 3. Start Local Infrastructure, Microservices & Live Logs
Start the entire local ecosystem in one command:
```bash
docker compose up --build -d
# or via npm script:
npm run docker:up
```

Services and monitoring will be immediately available at:
- **Dozzle Live Logs**: [http://localhost:8888](http://localhost:8888) — *Real-time log stream for all containers*
- **Auth Service**: [http://localhost:8001/health](http://localhost:8001/health)
- **Quiz Service**: [http://localhost:8002/health](http://localhost:8002/health)
- **Payments Service**: [http://localhost:8003/health](http://localhost:8003/health)
- **PostgreSQL**: `localhost:5432`
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (guest / guest)

To stop all services in one place:
```bash
docker compose down
# or via npm script:
npm run docker:down
```

### 4. Run Frontend Apps Locally
```bash
# Run Web app (Vite on :3000)
npm run dev --workspace=apps/web

# Run Admin app (Vite on :3001)
npm run dev --workspace=apps/admin

# Run Mobile app (Expo)
npm run dev --workspace=apps/mobile
```

---

## Testing & Quality Assurance

- **Python Services**:
  ```bash
  cd services/auth-service && pytest && ruff check . && mypy app/
  cd services/quiz-service && pytest && ruff check . && mypy app/
  cd services/payments-service && pytest && ruff check . && mypy app/
  ```
- **Monorepo Lint & Typecheck**:
  ```bash
  npm run lint
  npm run typecheck
  ```

---

## Documentation

All design specs and decisions live under `docs/`:
- [`PRD`](docs/prd.md)
- [`System Architecture`](docs/system_architecture.md)
- [`Tech Stack`](docs/tech_stack.md)
- [`Data Model`](docs/data_modal.md)
- [`API Contract`](docs/api_contract.md)
- [`Repo Structure`](docs/repo_structure.md)
- [`Coding Style & Testing`](docs/coding_style_testing.md)
