# FastQuiz — Coding Style, Conventions & Testing

*Living doc. Point every coding-agent session at this before it writes code.*

## Git Workflow
- **Branching**: trunk-based — short-lived feature branches off `main`, merged via PR, `main` protected (CI must pass before merge). Simpler than Git Flow for a solo/small-team project and keeps AI-agent-generated branches from piling up.
- **Commits**: Conventional Commits — `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`. Enables auto-generated changelogs later if useful.
- **PRs**: one PR per service/app change where possible (matches the path-filtered CI from the repo structure doc).

## Python (services)
- **Formatting/linting**: Ruff (covers both — replaces Black + isort + flake8, faster, single config)
- **Type checking**: mypy, strict mode on `app/` (not on `tests/`)
- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes/Pydantic models, `UPPER_CASE` for constants
- **Error handling**: raise typed exceptions (custom exception classes per domain, e.g. `QuizNotFoundError`), caught by a FastAPI exception handler that maps to consistent JSON error responses (`{error_code, message}`)
- **Structure**: routers stay thin — business logic lives in a `services/` or `logic/` layer within each service, not in route handlers directly

## TypeScript (web / mobile / admin)
- **Formatting/linting**: ESLint + Prettier
- **TypeScript**: `strict: true` in `tsconfig.json` — no `any` without justification
- **Naming**: `camelCase` for functions/variables, `PascalCase` for components/types
- **State/data fetching**: API calls only through `packages/shared`'s typed client — no ad-hoc `fetch()` calls in components
- **Components**: functional components + hooks only

## Testing
| Layer | Tool | Notes |
|---|---|---|
| Python unit/integration | pytest + pytest-cov | test DB interactions against a test Postgres/Mongo instance (via `docker-compose.test.yml`), not mocks, for anything touching real queries |
| Web/Admin (React) | Vitest + React Testing Library | test behavior, not implementation details |
| Mobile (React Native) | Jest + React Native Testing Library | |
| E2E | Playwright (web), not required for v1 mobile | add once core flows stabilize |

- **Coverage**: minimum **80%** enforced in CI per service/app (fails the PR check if below). Applies to `app/`/`src/` — exclude generated code and config files.
- **What must be tested before merge**: any new API endpoint, any payment/unlock logic, any auth flow — these are the paths where bugs cost money or leak content.

## CI Gate (per GitHub Actions workflow)
1. Lint (Ruff / ESLint)
2. Type check (mypy / tsc)
3. Tests + coverage threshold
4. Build (Docker image for services, build output for web/admin)

## Open Questions
- Pre-commit hooks (run lint/format locally before commit) — worth adding once the repo scaffold exists?