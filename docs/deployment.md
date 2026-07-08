# AtarLab — Deployment, Docker & CI/CD

## 1. Environments

| Env | Purpose | DB | Payments |
|---|---|---|---|
| `local` | dev machines | Docker Postgres | Razorpay/Stripe test keys |
| `staging` | pre-prod QA, client demos | managed Postgres (small tier) | test keys |
| `production` | live | managed Postgres (HA, daily backups) | live keys |

Angular 20's SSR server validates the incoming `Host` header against an allowlist (SSRF hardening) and falls back to client-side rendering if it doesn't match — set `NG_ALLOWED_HOSTS` (comma-separated) to the real hostname(s) the SSR server is served behind in every environment, e.g. `NG_ALLOWED_HOSTS=atarlab.com,www.atarlab.com`. Locally this defaults to `localhost:4000,localhost` via the `serve:ssr:atarlab-frontend` script.

Secrets (`.env`) are never committed. `.env.example` in each repo documents every required key with dummy placeholder values. Local dev and staging use **sandbox/test credentials** for Razorpay, Stripe, Cloudinary/S3, and Google OAuth per current phase decision — swapping to live keys later is a pure config change.

## 2. `atarlab-backend` Docker

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```yaml
# docker/docker-compose.yml (local dev)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: atarlab
      POSTGRES_USER: atarlab
      POSTGRES_PASSWORD: atarlab_dev
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U atarlab"]
      interval: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@atarlab.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports: ["5050:80"]
    depends_on: [postgres]

  api:
    build: { context: .., dockerfile: docker/Dockerfile }
    env_file: ../.env
    ports: ["3000:3000"]
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_started }

volumes:
  pgdata:
```

## 3. `atarlab-frontend` Docker (SSR Node server)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:ssr

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist/atarlab-frontend ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/server/server.mjs"]
```

**A note on `environment.prod.ts`'s relative `apiUrl: '/api/v1'`**: this only resolves
correctly once the reverse proxy in section 4 is in front of both services on one origin.
`angular.json`'s `fileReplacements` (added in Phase 5) swaps `environment.ts` for
`environment.prod.ts` on any `--configuration production` build (which `ng build`
defaults to) — so testing that build locally with the frontend and backend on separate
ports (no reverse proxy) will have the SSR server try to fetch its own origin instead of
the backend and hang. For local testing without a reverse proxy, build with
`--configuration development` instead (still produces a working SSR bundle, just
unminified) so `environment.ts`'s absolute `http://localhost:3000/api/v1` is used.

## 4. Reverse proxy / routing (production)

Nginx (or platform equivalent — Render/Railway/Fly.io ingress) terminates TLS and routes:
- `atarlab.com/` → Angular SSR Node server (port 4000)
- `atarlab.com/api/*` → NestJS (port 3000)
- `atarlab.com/socket.io/*` → NestJS (WebSocket upgrade, sticky sessions if horizontally scaled — use Redis adapter for Socket.IO: `@socket.io/redis-adapter`)
- Static assets/images served from Cloudinary/S3 CDN URLs directly, not proxied through the app.

## 5. CI/CD (GitHub Actions, one workflow per repo since they're separate)

**`atarlab-backend/.github/workflows/ci.yml`**
1. `on: pull_request, push:main`
2. Job `lint-test`: checkout → setup Node 20 → `npm ci` → `npm run lint` → `npm run test` (unit) → spin up Postgres service container → `npm run test:integration` → `npm run build`.
3. Job `migrate-check` (PR only): run `typeorm migration:show` against a throwaway DB to catch missing/out-of-order migrations.
4. Job `deploy` (on `main`, after `lint-test` passes): build & push Docker image to registry (GHCR/ECR) → trigger deploy (Render/Fly/ECS) → run `typeorm migration:run` against target DB → health-check `/health`.

**`atarlab-frontend/.github/workflows/ci.yml`**
1. `lint-test`: `npm ci` → `npm run lint` → `npm run test` (Karma/Jest unit) → `npm run e2e` (Playwright, against a preview deploy or local SSR server) → `npm run build:ssr`.
2. `deploy` (on `main`): build Docker image → push → deploy to Node hosting (Render/Vercel-with-custom-server/self-managed).
3. Lighthouse CI step on PRs against preview URL — fails build if Performance/Accessibility/SEO scores regress below threshold (e.g. 90).

Both repos: branch protection on `main` (require PR + passing CI + 1 review), Renovate/Dependabot for dependency updates, `CODEOWNERS` for domain-critical paths (payments, auth).

## 6. Observability

- Structured JSON logging (`nestjs-pino` or Winston) with request-id correlation, shipped to a log sink (e.g. Grafana Loki / CloudWatch).
- `LoggingInterceptor` logs method, path, status, duration, userId (redacted PII).
- Sentry wired on both frontend (`@sentry/angular`, browser-only) and backend (`@sentry/nestjs`, hooked into the existing `AllExceptionsFilter` for every 5xx) — inert until `SENTRY_DSN` (backend `.env`) / `sentryDsn` (`environment.prod.ts`) are set to a real project DSN, same sandbox-fallback pattern as Razorpay/Cloudinary/Mail. Add release tagging tied to CI commit SHA when wiring a real CI pipeline.
- `/health`, `/health/db`, `/health/redis` liveness/readiness endpoints wired to the hosting platform's health checks.

## 7. Scaling notes (post-MVP)

- Stateless NestJS instances behind a load balancer; Socket.IO uses the Redis adapter so tracking events fan out correctly across instances.
- Read-heavy catalog endpoints get a Redis cache layer (`cache-manager`) keyed by query+filters, invalidated on product/category writes.
- Background jobs (invoice PDF generation, email sending, abandoned-cart reminders) move to BullMQ workers backed by the same Redis, so request/response paths stay fast.
