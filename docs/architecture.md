# AtarLab — System Architecture

Luxury Attar & Perfume e-commerce platform. Two independent repositories, connected by a versioned REST/WS contract.

## 1. Repos

- `atarlab-backend` — NestJS 10+, TypeORM, PostgreSQL, Socket.IO, Redis (cache/queues), Razorpay/Stripe SDKs.
- `atarlab-frontend` — Angular 18+, Standalone Components, Signals, SSR (Angular Universal), PWA.

They communicate over:
- REST (`/api/v1/...`), versioned from day one.
- WebSocket namespace `/tracking` for live order tracking.
- A shared **OpenAPI 3.1 spec** (`openapi.yaml`) hand-maintained in the backend repo and used to generate a typed Angular HTTP client (`openapi-typescript-codegen` or `ng-openapi-gen`) — this is how "shared types" are achieved across two repos without a monorepo.

## 2. High-level system diagram (text)

```
┌────────────────────┐        HTTPS/WSS        ┌──────────────────────┐
│  Angular SSR App    │◄────────────────────────►│   NestJS API Gateway  │
│  (Node server on    │                          │   (Nginx reverse      │
│   Vercel/Render/    │                          │    proxy in front)    │
│   custom Node host) │                          └──────────┬────────────┘
└─────────┬───────────┘                                     │
          │ CDN (static assets, images)                     │
          ▼                                                 ▼
   ┌─────────────┐                                  ┌───────────────┐
   │ Cloudinary/ │                                  │  PostgreSQL   │
   │   S3        │                                  │  (primary DB) │
   └─────────────┘                                  └───────────────┘
                                                             │
                                              ┌──────────────┼──────────────┐
                                              ▼              ▼              ▼
                                        ┌──────────┐  ┌────────────┐ ┌───────────┐
                                        │  Redis   │  │  Razorpay   │ │  Email/   │
                                        │ (cache,  │  │  / Stripe   │ │  SMS/OTP  │
                                        │  queues, │  │  Payment    │ │  Provider │
                                        │  BullMQ) │  │  Gateway    │ │  (SES/    │
                                        └──────────┘  └────────────┘ │  Twilio)  │
                                                                     └───────────┘
```

## 3. Backend — `atarlab-backend` folder structure

NestJS "modular clean architecture": each domain module owns its `controller / service / entity / dto / repository`. Cross-cutting concerns live in `common/`.

```
atarlab-backend/
├── src/
│   ├── main.ts                         # bootstrap, Helmet, CORS, global pipes/filters, Swagger
│   ├── app.module.ts
│   ├── config/
│   │   ├── configuration.ts            # typed config factory (env → typed object)
│   │   ├── validation.schema.ts        # Joi/Zod env validation
│   │   └── database.config.ts
│   ├── database/
│   │   ├── data-source.ts              # TypeORM CLI data source (migrations)
│   │   ├── migrations/
│   │   └── seeds/
│   │       ├── seed-roles.ts
│   │       ├── seed-categories.ts
│   │       ├── seed-products.ts
│   │       └── run-seed.ts
│   ├── common/
│   │   ├── decorators/                 # @CurrentUser, @Roles, @Public, @ApiPaginatedResponse
│   │   ├── guards/                     # JwtAuthGuard, RolesGuard, RefreshTokenGuard, ThrottlerGuard
│   │   ├── interceptors/               # LoggingInterceptor, TransformResponseInterceptor, TimeoutInterceptor
│   │   ├── filters/                    # AllExceptionsFilter, HttpExceptionFilter, TypeOrmExceptionFilter
│   │   ├── pipes/                      # ParseUUIDPipe wrapper, TrimPipe, ValidationPipe options
│   │   ├── dto/                        # PaginationDto, ApiResponseDto
│   │   ├── enums/                      # OrderStatus, PaymentStatus, Role, DiscountType...
│   │   ├── utils/                      # slugify, money, date helpers
│   │   └── interfaces/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/             # jwt.strategy.ts, jwt-refresh.strategy.ts, google.strategy.ts
│   │   │   ├── dto/                    # register, login, otp-verify, refresh, forgot-password, reset-password
│   │   │   └── entities/               # refresh-token.entity.ts, otp.entity.ts
│   │   ├── users/
│   │   ├── addresses/
│   │   ├── roles-permissions/          # RBAC: role, permission, role_permission
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── products/
│   │   │   ├── entities/                # product, product-variant, product-image, fragrance-note, product-attribute
│   │   │   └── ...
│   │   ├── inventory/
│   │   ├── reviews/
│   │   ├── wishlist/
│   │   ├── cart/
│   │   ├── coupons/
│   │   ├── offers/
│   │   ├── orders/
│   │   │   ├── entities/                # order, order-item, order-status-history, invoice
│   │   ├── payments/                    # razorpay.provider.ts, stripe.provider.ts, payment.service.ts
│   │   ├── shipping/                    # shipping-zone, shipping-rate, delivery-agent
│   │   ├── tracking/
│   │   │   ├── tracking.gateway.ts       # Socket.IO gateway, namespace /tracking
│   │   │   └── tracking.service.ts
│   │   ├── notifications/               # in-app + push + email templates
│   │   ├── banners/
│   │   ├── search/                      # Postgres full-text search / typesense adapter
│   │   ├── content/                     # blog, faq, testimonials, instagram-feed
│   │   ├── newsletter/
│   │   ├── uploads/                     # cloudinary.service.ts / s3.service.ts (behind UploadPort interface)
│   │   ├── analytics/                   # dashboard aggregates, revenue reports
│   │   └── activity-logs/               # admin audit trail
│   └── health/                          # /health, /health/db, /health/redis
├── test/
│   ├── unit/
│   ├── integration/                     # Testcontainers Postgres
│   └── e2e/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

Design rules:
- Every module exposes a `*.module.ts` with explicit `imports/providers/controllers/exports` — no global providers except `common/`.
- Controllers are thin: validate (DTO + `ValidationPipe`) → delegate to service → return via `TransformResponseInterceptor` (consistent `{ success, data, meta }` envelope).
- Services never touch `Request`/`Response` — enables reuse from queue consumers (BullMQ) and Socket gateways.
- All entities go through repositories via `@InjectRepository`; complex queries live in dedicated `*.repository.ts` using QueryBuilder, not in services.
- Storage (Cloudinary vs S3) and Payments (Razorpay vs Stripe) are implemented as **ports/adapters** (`UploadPort`, `PaymentPort` interfaces) so swapping providers is a DI binding change, not a rewrite.

## 4. Frontend — `atarlab-frontend` folder structure

Angular standalone + Signals, feature-based, lazy-loaded routes.

```
atarlab-frontend/
├── src/
│   ├── main.ts
│   ├── main.server.ts                   # SSR entry
│   ├── server.ts                        # Express SSR server
│   ├── app/
│   │   ├── app.config.ts                # providers: router, http, SSR transfer-state, animations
│   │   ├── app.routes.ts                # top-level lazy routes
│   │   ├── app.component.ts
│   │   ├── core/
│   │   │   ├── interceptors/            # auth.interceptor.ts, error.interceptor.ts, loading.interceptor.ts
│   │   │   ├── guards/                  # auth.guard.ts, admin.guard.ts, guest.guard.ts
│   │   │   ├── services/                # api.service.ts (generated client wrapper), token.service.ts,
│   │   │   │                            # cart.service.ts (signals-based state), socket.service.ts
│   │   │   ├── state/                   # signal stores: auth.store.ts, cart.store.ts, wishlist.store.ts
│   │   │   └── models/                  # generated + hand-written interfaces
│   │   ├── shared/
│   │   │   ├── components/              # button, price, rating-stars, badge, skeleton, modal, toast,
│   │   │   │                            # image-zoom, quantity-stepper, empty-state, breadcrumb
│   │   │   ├── directives/              # lazy-img, click-outside, ripple
│   │   │   ├── pipes/                   # currency-inr, truncate, time-ago
│   │   │   └── layout/                  # header, footer, mobile-bottom-nav, sticky-cart-bar
│   │   ├── features/
│   │   │   ├── home/                    # hero, featured-collections, best-sellers, trending,
│   │   │   │                            # new-arrivals, testimonials, instagram-feed, blog-teaser, faq, newsletter
│   │   │   ├── auth/                    # login, register, otp-verify, forgot-password, reset-password,
│   │   │   │                            # google-callback
│   │   │   ├── catalog/                 # product-list (filters/sort), product-detail (gallery/zoom/notes),
│   │   │   │                            # category-page, brand-page, search-results
│   │   │   ├── cart/
│   │   │   ├── checkout/                # address-step, payment-step (razorpay), review-step, order-success
│   │   │   ├── orders/                  # order-history, order-detail, live-tracking (map + socket)
│   │   │   ├── wishlist/
│   │   │   ├── profile/                 # account, addresses, orders, wishlist, notifications, security
│   │   │   ├── static/                  # blog, blog-detail, faq, about, contact, testimonials
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       ├── products/ (+categories, brands)
│   │   │       ├── banners/ coupons/ offers/ inventory/
│   │   │       ├── customers/ orders/ reviews/
│   │   │       ├── notifications/ reports/ settings/
│   │   │       ├── roles-permissions/ activity-logs/
│   │   │       └── admin-layout/        # admin shell with sidebar, guarded by RBAC
│   ├── environments/
│   ├── styles/                          # design tokens (scss vars), themes (light/dark), tailwind config
│   └── assets/
├── e2e/                                  # Playwright
├── ngsw-config.json                      # PWA service worker config
├── angular.json
└── package.json
```

Design rules:
- **Signals for local/component state**, RxJS only at I/O boundaries (HTTP, sockets, router events).
- Global state (`auth`, `cart`, `wishlist`) as injectable **signal stores** — plain classes with `signal()`/`computed()`, no NgRx needed at this scope.
- Every feature route is `loadComponent`/`loadChildren` lazy. Admin module is one big lazy chunk behind `AdminGuard` (role check) so its weight never hits customer-facing bundles.
- SSR: product/category/home pages render on server for SEO; cart/checkout/admin can be `@defer`/client-render-heavy since they're behind auth or non-indexable.

## 5. Routing strategy (frontend)

```
/                              → home (SSR)
/shop                          → product-list (SSR, query-param filters)
/shop/:categorySlug            → category page (SSR)
/brand/:brandSlug              → brand page (SSR)
/product/:slug                 → product detail (SSR, JSON-LD schema.org/Product)
/search?q=                     → search results
/cart                          → cart (CSR)
/checkout                      → checkout wizard (CSR, AuthGuard)
/checkout/success/:orderId     → order success
/account                       → profile shell (AuthGuard)
  /account/orders
  /account/orders/:id          → order detail + live tracking
  /account/wishlist
  /account/addresses
  /account/notifications
  /account/security
/auth/login | /register | /otp | /forgot-password | /reset-password
/auth/google/callback
/blog, /blog/:slug, /faq, /about, /contact
/admin (AdminGuard: role in [ADMIN, STAFF])
  /admin/dashboard
  /admin/products, /categories, /brands
  /admin/banners, /coupons, /offers, /inventory
  /admin/customers, /orders, /reviews
  /admin/notifications, /reports, /settings
  /admin/roles-permissions, /activity-logs
```

Route guards: `authGuard` (functional, `CanActivateFn`) checks signal-based `AuthStore.isAuthenticated()`; `adminGuard` additionally checks `AuthStore.hasRole('ADMIN'|'STAFF')`; `guestGuard` blocks authed users from `/auth/*`.

## 6. Cross-cutting: environment & versioning

- API versioned via URL prefix `/api/v1`. Breaking changes bump to `/api/v2` behind a separate controller set — old clients keep working.
- `.env` per environment (`local`, `staging`, `production`) validated at boot via Joi/Zod; app **fails fast** if required vars are missing.
- Feature flags (e.g. Stripe on/off, voice search on/off) via a simple `feature_flags` table + `/config/public` endpoint consumed by the frontend at app init.
