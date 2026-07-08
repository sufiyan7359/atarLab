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

## Phase 3 — Live tracking & delivery experience (done)
- [x] `delivery_agents`, `order_deliveries` entities; admin UI to assign an agent and advance status.
- [x] `TrackingGateway` (Socket.IO namespace `/tracking`), room-per-order, JWT handshake auth, personal room per user for notification pushes.
- [x] Frontend live-tracking page: status timeline (Confirmed→Packed→Picked→Shipped→Out for Delivery→Delivered), ETA, delivery agent card, Leaflet map plotting live lat/lng (chosen over Mapbox — no API key needed, consistent with the sandbox-first approach).
- [x] Order-status push notifications: in-app `notifications` table + real-time header bell badge over the same socket connection.

**Exit criteria**: advancing an order's status in the admin panel updates the customer's tracking page in real time without a page refresh. **Verified**: a Playwright run with two separate browser sessions (admin + customer) confirmed the customer's already-open tracking page updates its status badge, delivery-agent card, and live map marker position — and the header notification badge increments — the instant the admin assigns an agent and advances the order to OUT_FOR_DELIVERY, with zero page reloads (10/10 checks passed).

Since there's no real delivery fleet or address geocoding in this sandbox, `DeliverySimulatorService` interpolates the agent's position from a fixed dispatch point to a per-order deterministic destination over ~60s — this is what makes the map move without a live GPS feed. Web push (as opposed to in-app notifications) was left out as genuinely optional per the original scope.

## Phase 4 — Growth & experience polish (done)
- [x] Full content module: blog, FAQ, testimonials, Instagram-style social feed, newsletter — wired into homepage sections started as placeholders in Phase 1, plus a `/blog` list + detail page and an admin content management screen.
- [x] Search: debounced instant-suggestions dropdown, voice search (Web Speech API), typo tolerance via Postgres `pg_trgm` + `word_similarity()` fallback (kept on Postgres rather than adding Typesense/Meilisearch infra — FTS wasn't the bottleneck, ILIKE-miss-on-typo was, and pg_trgm solves that without a new service to run).
- [x] Wishlist polish: `priceAtAdd` captured at add-time, a "Price dropped" badge when the current price is lower (move-to-cart already existed from Phase 1).
- [x] "Frequently bought together": ranks products by real order co-occurrence, falling back to same-category products when purchase history is too sparse.
- [x] PWA: manifest (branded, gold theme-color), service worker (production-only, `registerWhenStable:30000`), a `dataGroups` cache for the public catalog API so browsing works offline, installable.
- [x] Accessibility pass, scoped to customer-facing pages per this roadmap's own wording (admin is an internal ops tool): toast notifications now announced via `role="status"`/`aria-live` and keyboard-dismissible; unlabeled form fields on checkout/addresses/profile fixed with proper `for`/`id` pairing; `--accent-strong` darkened after computing it only cleared 4.02:1 contrast against white (below AA's 4.5:1) for what is body-sized link/price text everywhere.
- [x] Performance pass: Cloudinary responsive `srcset`/width-transform on product card images (no-ops safely for non-Cloudinary URLs like the picsum seed images), `loading="lazy"` on remaining below-the-fold images, confirmed the production bundle (432kB raw / 125kB gzip initial) is well inside budget.
- [x] Theme polish: audited every CSS custom property across light/dark — found `--success`/`--danger` only cleared ~3.2-3.8:1 against the dark background (below AA), brightened them for dark mode the same way `--accent` already gets a lighter shade there.

**Verified**: a 12-check Playwright run against the production SSR build — home page content sections, newsletter subscribe, blog list/detail navigation, typo-tolerant search suggestions, voice search UI, frequently-bought-together, and PWA manifest/service-worker registration — all passed against the real backend. Caught and fixed one genuine bug along the way: the blog card's `routerLink` was relative (`[post.slug]`) where `/blog` and `/blog/:slug` are sibling routes, not parent-child, so it resolved to the wrong URL entirely; fixed to `['/blog', post.slug]`.

## Phase 5 — Hardening & launch readiness (engineering work done; launch itself is not)
- [x] Load testing checkout + catalog endpoints; tune indexes/caching found lacking.
- [x] Security review: dependency audit, OWASP top 10 pass, secrets rotation runbook, rate-limit tuning.
- [x] Backup/restore drill for Postgres; disaster-recovery runbook.
- [x] Legal/compliance pages (privacy policy, terms, refund policy), cookie consent.
- [ ] Soft launch → monitor Sentry/logs → public launch — **not done**, and can't be from
      here: this needs real hosting, a real domain, and a real business decision to go
      live. Sentry itself is wired and verified to initialize correctly on both sides, but
      with no `SENTRY_DSN` configured anywhere, nothing is actually being monitored yet.
      See `docs/launch-checklist.md` for the full done-vs-not-done breakdown and the
      recommended sequence to actually get there.

Real bugs found and fixed this phase (via actual review/testing, not just written docs):
crashes in `WishlistService`/`ReviewsService` from the same TypeORM `undefined`-in-where
pattern (unverified review submissions were 500ing), a missing index on
`order_items.variant_id`, no configured Postgres connection-pool size (confirmed via
`pg_stat_activity` that 20 concurrent requests saturated node-postgres's default of 10), a
too-tight global rate limit that would have throttled legitimate catalog browsing once
Phase 4's instant-search-suggestions started firing per keystroke, two dead footer links
(`/faq`, `/contact`) and a non-functional footer newsletter form, a `--accent-strong`/
`--success`/`--danger` contrast shortfall against WCAG AA in various theme combinations,
and — while wiring Sentry — a genuine `fileReplacements` gap that meant `environment.prod.ts`
had been dead code since Phase 0.

## Sequencing rationale
Payments and inventory correctness are the highest-risk, highest-value pieces — they're proven in Phase 1 while the codebase is small and easy to reason about. Admin tooling (Phase 2) is deliberately after MVP commerce so it manages *real* entities/relationships instead of being built against guesses. Live tracking (Phase 3) depends on the order-status state machine already existing from Phase 2's admin order management. Growth/polish (Phase 4) is intentionally last among features since it's the least risky to bolt on and benefits most from a stable foundation underneath it.
