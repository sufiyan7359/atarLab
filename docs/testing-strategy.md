# AtarLab — Testing Strategy

## Guiding principle

Test pyramid, not test iceberg: many fast unit tests, a meaningful layer of integration tests against a real Postgres (via Testcontainers), and a thin layer of true e2e tests covering only the money paths (auth, checkout, tracking).

## Backend (`atarlab-backend`)

**Unit tests** (Jest, `*.spec.ts` beside source)
- Services tested with mocked repositories (`jest-mock-extended` or manual mocks) — e.g. `OrdersService` tested for total calculation, coupon application edge cases, stock-insufficient rejection.
- Guards/pipes/interceptors tested in isolation (e.g. `RolesGuard` given various `req.user.roles`).
- Pure utils (money rounding, slugify, OTP hashing) — trivial, high-value, fast.

**Integration tests** (Jest + Testcontainers Postgres, real TypeORM connection)
- Spin up an ephemeral Postgres container per test suite, run migrations, seed minimal fixtures.
- Cover repository query correctness (e.g. product filter/sort query builder, coupon usage-limit race), and module wiring (controller→service→repository through Nest's `Test.createTestingModule`).
- Payment webhook idempotency: assert a duplicate `provider_payment_id` webhook does not double-credit an order.

**E2E tests** (Jest + Supertest, against a fully bootstrapped Nest app + Testcontainers DB)
- Auth: register → verify → login → refresh → logout; OTP login; token-reuse revocation.
- Checkout: add to cart → apply coupon → checkout → simulate Razorpay webhook → order status CONFIRMED → stock decremented.
- Admin RBAC: STAFF without `products.create` permission gets 403 on `POST /admin/products`.

**Coverage gate**: 80% lines on `services/` and `guards/`, enforced in CI (`--coverage --coverageThreshold`).

## Frontend (`atarlab-frontend`)

**Unit tests** (Jest or Karma/Jasmine — Jest preferred for speed with Angular's `jest-preset-angular`)
- Signal stores (`CartStore`, `AuthStore`) tested as plain classes — assert `computed()` values react correctly to `signal.set()`.
- Pipes/directives in isolation.
- Component tests via Angular Testing Library: assert rendered output and user-facing behavior (e.g. "clicking add-to-cart calls CartStore.add with correct variantId"), not internal implementation details.

**Integration tests**
- `HttpClientTestingModule`/`provideHttpClientTesting` to verify interceptors (auth header attached, 401 triggers refresh-and-retry queueing).
- Route guard tests with a mocked Router/AuthStore.

**E2E tests** (Playwright)
- Golden path: browse → product detail → add to cart → guest checkout with COD → order success page.
- Registered-user path: login → checkout with Razorpay test card → order appears in `/account/orders` → live tracking page connects and receives a status update (assert against a test-seeded order whose status is advanced via an admin API call mid-test).
- Search: type query → instant suggestions appear → navigate to result.
- Accessibility smoke: `axe-playwright` assertions on home, PDP, cart, checkout pages.
- Visual/responsive: run critical flows at mobile (375px) and desktop (1440px) viewports.

**Lighthouse CI** on PR preview deploys — Performance/Accessibility/Best-Practices/SEO thresholds (≥90) as a merge gate.

## Cross-cutting

- Contract tests: the generated Angular HTTP client is type-checked against `openapi.yaml` in CI — a backend DTO change that breaks the contract fails frontend CI before it ever reaches staging.
- Load testing (k6) on checkout and product-listing endpoints before major sales/launch events — not part of default CI, run on-demand against staging.
- Seed data (`database/seeds`) is the fixture source for integration/e2e tests, kept small and deterministic (fixed UUIDs) so assertions aren't flaky.
