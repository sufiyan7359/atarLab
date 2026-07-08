# AtarLab

A luxury Attar & Perfume e-commerce platform — Angular 20 (SSR, standalone, signals) storefront
and admin console, backed by a NestJS + PostgreSQL API with sandboxed Razorpay payments and
Cloudinary/local-disk media storage.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Angular 20 (standalone components, signals, SSR), no external chart lib for admin analytics |
| Backend | NestJS 11, TypeORM, PostgreSQL |
| Auth | JWT access tokens + rotating, family-scoped refresh tokens (httpOnly cookie) |
| Payments | Razorpay (sandbox no-op fallback when no keys are configured) |
| Media | Cloudinary (local-disk fallback under `atarlab-backend/uploads` when no keys are configured) |

## Structure

```
atarlab-backend/    NestJS API — auth, catalog, cart, checkout, orders, admin modules
atarlab-frontend/   Angular SSR app — storefront + /admin console
docs/                architecture, DB schema, API spec, auth flow, deployment, roadmap
```

## Features

**Storefront:** registration/login (email+password, OTP, Google OAuth stub), product catalog with
variants/notes/ingredients, cart with guest merge-on-login, coupons, Razorpay + COD checkout, order
history & invoices, reviews, wishlist, SSR for SEO-critical pages.

**Admin console** (`/admin`, RBAC-gated): dashboard with revenue chart, product/category/brand/
banner/coupon/offer CRUD with image upload, inventory adjustments with low-stock alerts, order
status management with refunds, customer management, review moderation, reports with CSV export,
activity log of every admin mutation, roles & permissions, site settings.

See `docs/roadmap.md` for phase-by-phase status.

## Getting started

Prerequisites: Node 20+, PostgreSQL running locally.

### 1. Backend

```bash
cd atarlab-backend
npm install
cp .env.example .env   # fill in DB_* at minimum; everything else has a working sandbox fallback
npm run migration:run
npm run seed            # roles, catalog, an admin user, sample banners
npm run start:dev       # http://localhost:3000, Swagger at /api/docs
```

Seeded admin login: `admin@atarlab.com` / `Admin@12345`.

### 2. Frontend

```bash
cd atarlab-frontend
npm install
npm start                # ng serve, http://localhost:4200
```

For an SSR build instead of the dev server:

```bash
npm run build
npm run serve:ssr:atarlab-frontend   # http://localhost:4000
```

Make sure `CORS_ORIGIN` / `FRONTEND_URL` in the backend `.env` match whichever origin you're serving
the frontend from.

## Docs

- `docs/architecture.md` — system overview
- `docs/database-schema.md` — ER diagram + schema notes
- `docs/api-specification.md` — REST endpoints
- `docs/auth-flow.md` — JWT/refresh-token/session design
- `docs/deployment.md` — production deployment notes
- `docs/testing-strategy.md`
- `docs/roadmap.md` — phased build plan and current status
