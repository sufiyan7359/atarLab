# AtarLab — Phased Implementation Roadmap

Chosen strategy: **MVP commerce core first**, then admin, then advanced/experience features. Each phase should be independently demoable and mergeable — no phase leaves the app in a broken state.

## Phase 0 — Foundations (done)
- [x] Architecture, DB schema + ER diagram, API spec, auth flow, deployment, testing strategy docs (`docs/`).
- [x] `atarlab-backend`: repo init, NestJS project, ESLint/Prettier, `common/` scaffolding (filters, interceptors, guards, pipes), `config/` with env validation, Docker Compose (Postgres/Redis/pgAdmin), initial TypeORM data source + first migration (extensions: `pgcrypto`, `citext`).
- [x] `atarlab-frontend`: repo init, Angular 20 standalone + SSR project, design tokens (colors incl. gold accent, typography, spacing), shared UI kit shell (button, card, skeleton), `core/` interceptors+guards scaffolding, dark/light theme toggle wiring.

## Phase 1 — MVP commerce core (done)
Goal: a real customer can register, browse, buy, and pay in sandbox mode end-to-end.

Backend:
1. `users`, `roles`, `permissions`, `addresses` entities + migrations + seed (roles: SUPER_ADMIN/ADMIN/STAFF/CUSTOMER).
2. `auth` module: register, login, JWT+refresh, OTP (email first, SMS provider stubbed), Google OAuth, forgot/reset password, email verification.
3. `categories`, `brands`, `products` (+variants, images, fragrance notes, ingredients) entities, migrations, seed data (~30 realistic attar/perfume products).
4. `cart`, `cart_items` with guest-session support + merge-on-login.
5. `coupons` (basic percentage/fixed) applied to cart.
6. `orders`, `order_items`, `order_status_history`, `payments`, `invoices` + Razorpay sandbox integration (order creation, signature verification, webhook).
7. Basic `reviews` (create + list approved) and `wishlist`.
8. Swagger/OpenAPI live at `/api/docs`.

Frontend:
1. Layout shell: header (search, cart icon, account), footer, mobile bottom nav, sticky cart bar.
2. Home page: hero banner, featured collections, best sellers, new arrivals (static/backed by `is_featured` flag) — testimonials/blog/Instagram/FAQ sections can start as static placeholders wired to real endpoints once `content` module lands.
3. Auth pages: login, register, OTP verify, forgot/reset password, Google callback handling.
4. Product listing (filters, sort, pagination) + product detail (gallery+zoom, notes tabs, reviews, related products).
5. Cart page (coupon, gift wrap, notes, shipping/tax estimate) + sticky mini-cart.
6. Checkout wizard: address → payment (Razorpay Checkout.js + COD) → review → success page.
7. Account: order history, order detail, addresses, basic profile edit.
8. SSR verified working for home/PDP/category (view-source shows rendered content); basic SEO meta tags + `Product` JSON-LD.

**Exit criteria for Phase 1**: a fresh user can sign up, browse the seeded catalog, add to cart as a guest, log in (cart merges), apply a coupon, pay via Razorpay test card, see the order in their account, and receive an emailed invoice — all against real (sandboxed) integrations, no mocked data left in the request path.

## Phase 2 — Admin dashboard & operations (done)
- [x] RBAC enforcement across all admin routes (`RolesGuard` + `PermissionsGuard`), roles/permissions CRUD UI.
- [x] Product/Category/Brand/Banner/Coupon/Offer CRUD screens with image upload (Cloudinary adapter, local-disk sandbox fallback).
- [x] Inventory management (stock adjustments, low-stock alerts).
- [x] Orders management (status transitions — this is what will later drive live tracking), refunds.
- [x] Customer management, reviews moderation queue.
- [x] Dashboard analytics (revenue chart, top products) + Reports with CSV export.
- [x] Activity log capture wired into all admin mutation endpoints via a global interceptor.
- [x] Settings screen (site config, tax/shipping defaults, payment method toggles).

**Exit criteria**: an ops team can run the store day-to-day — add products, manage a coupon campaign, process an order, moderate a review — without touching the database directly. **Verified** via a full Playwright run through login → dashboard → category/product CRUD → orders → reviews → inventory → settings → roles → activity logs → RBAC-blocked non-admin, 12/12 checks passing against the real backend.

Not carried into Phase 2: order-funnel analytics beyond revenue/top-products/top-customers, and a dedicated admin notifications/broadcast screen — both deferred, not required for day-to-day store operation.

## Phase 3 — Live tracking & delivery experience
- `delivery_agents`, `order_deliveries` entities; admin UI to assign an agent and advance status.
- `TrackingGateway` (Socket.IO namespace `/tracking`), room-per-order, JWT handshake auth.
- Frontend live-tracking page: status timeline (Confirmed→Packed→Picked→Shipped→Out for Delivery→Delivered), ETA, delivery agent card, map (Leaflet/Mapbox) plotting live lat/lng.
- Order-status push notifications (in-app `notifications` table + optional web push).

**Exit criteria**: advancing an order's status in the admin panel updates the customer's tracking page in real time without a page refresh.

## Phase 4 — Growth & experience polish
- Full content module: blog, FAQ, testimonials, Instagram feed, newsletter — wired into homepage sections started as placeholders in Phase 1.
- Search: instant suggestions, voice search (Web Speech API), typo tolerance (consider Typesense/Meilisearch if Postgres FTS proves limiting).
- Wishlist polish (move-to-cart, price-drop alerts).
- "Frequently bought together" recommendation logic.
- PWA: manifest, service worker (`ngsw`), offline shell for catalog browsing, installability.
- Accessibility audit (WCAG 2.1 AA) pass across all customer-facing pages.
- Performance pass: image optimization/responsive `srcset` via Cloudinary transforms, skeleton loaders everywhere data is fetched, bundle budget enforcement.
- Dark/light theme full coverage + glassmorphism/gold-accent visual polish pass.

## Phase 5 — Hardening & launch readiness
- Load testing checkout + catalog endpoints; tune indexes/caching found lacking.
- Security review: dependency audit, OWASP top 10 pass, secrets rotation runbook, rate-limit tuning.
- Backup/restore drill for Postgres; disaster-recovery runbook.
- Legal/compliance pages (privacy policy, terms, refund policy), cookie consent.
- Soft launch → monitor Sentry/logs → public launch.

## Sequencing rationale
Payments and inventory correctness are the highest-risk, highest-value pieces — they're proven in Phase 1 while the codebase is small and easy to reason about. Admin tooling (Phase 2) is deliberately after MVP commerce so it manages *real* entities/relationships instead of being built against guesses. Live tracking (Phase 3) depends on the order-status state machine already existing from Phase 2's admin order management. Growth/polish (Phase 4) is intentionally last among features since it's the least risky to bolt on and benefits most from a stable foundation underneath it.
