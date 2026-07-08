# AtarLab — Authentication & Authorization Flow

## 1. Token model

- **Access token**: JWT, 15 min TTL, signed `HS256` (or `RS256` if multi-service later), payload `{ sub: userId, roles: string[], iat, exp }`. Sent as `Authorization: Bearer`.
- **Refresh token**: opaque random string, stored **hashed** (bcrypt/argon2) in `refresh_tokens`, 7-day TTL, delivered as `httpOnly, Secure, SameSite=Strict` cookie (never in JS-readable storage) — mitigates XSS token theft.
- **Rotation + reuse detection**: every `/auth/refresh` call issues a new refresh token and revokes the old one. If a revoked token is presented again (token reuse => likely stolen), the entire token family for that user is revoked and the user is forced to re-login.

## 2. Email/password registration & login

```
Client                      Backend                         DB / Email
  │  POST /auth/register       │                               │
  │────────────────────────────►│  hash password (argon2)       │
  │                             │  insert users (unverified)    │──► users
  │                             │  generate OTP / verify token   │──► otps
  │                             │  send verification email      │──► SES/Nodemailer
  │◄────── 201 (pending verify) │                               │
  │                             │                               │
  │  GET /auth/verify-email?t=  │                               │
  │────────────────────────────►│  validate token, set          │
  │                             │  email_verified_at             │──► users
  │◄────── 200                  │                               │
  │                             │                               │
  │  POST /auth/login           │                               │
  │────────────────────────────►│  verify password hash          │
  │                             │  issue access+refresh          │──► refresh_tokens
  │◄── access token (body) +    │                               │
      refresh cookie (Set-Cookie)
```

Unverified accounts can log in but are gated from checkout/reviews by an `EmailVerifiedGuard` on those specific routes (product decision, not a hard block on login — reduces drop-off).

## 3. OTP flow (email or SMS, e.g. for phone-first login)

```
POST /auth/otp/request  { identifier, purpose }
   → rate-limit check (5/min per identifier+IP)
   → generate 6-digit code, store bcrypt hash + expiresAt(5m) in `otps`
   → dispatch via email (Nodemailer/SES) or SMS (Twilio/MSG91)

POST /auth/otp/verify  { identifier, code, purpose }
   → fetch latest non-consumed otp for identifier+purpose
   → compare hash, check expiry, check attempts < 5
   → mark consumed_at; on purpose=LOGIN/REGISTER → find-or-create user → issue tokens
```

## 4. Google OAuth (Authorization Code flow via Passport `google` strategy)

```
Browser              Frontend                Backend                    Google
  │  click "Sign in     │                        │                          │
  │  with Google"       │                        │                          │
  │────────────────────►│  window.location =      │                          │
  │                      │  /api/v1/auth/google   ─►                         │
  │                      │                        │  redirect to Google      │
  │                      │                        │──────────────────────────►
  │                                                                          consent screen
  │◄─────────────────────────────────────────────────────────────────────────│
  │  redirect w/ code                                                        │
  │────────────────────────────────────────────►│ GET /auth/google/callback  │
  │                                               │  exchange code → profile │
  │                                               │  find user by google_id  │
  │                                               │  or email; create if new │
  │                                               │  issue access+refresh    │
  │◄──────────────── redirect to frontend ────────│  #access_token=...       │
  │                   /auth/google/callback?token= (frontend reads once,     │
  │                   stores in memory, drops from URL, sets refresh cookie  │
  │                   already set by backend redirect response)              │
```

Account linking rule: if a Google email matches an existing password-based account, link `google_id` onto that user rather than creating a duplicate — surfaced to the user as "an account with this email already exists, signing you in."

## 5. Forgot / reset password

```
POST /auth/forgot-password { email }
  → always 200 regardless of whether email exists (no user enumeration)
  → if exists: generate reset token (JWT, 30m, purpose=reset), email link
     https://atarlab.com/auth/reset-password?token=...

POST /auth/reset-password { token, newPassword }
  → verify token signature+expiry+purpose
  → hash newPassword, update users.password_hash
  → revoke ALL existing refresh_tokens for that user (force logout everywhere)
```

## 6. Backend guard/interceptor stack (applied per-route via decorators)

- `JwtAuthGuard` — validates access token via `jwt.strategy.ts` (Passport), attaches `req.user`.
- `@Public()` decorator + global `AuthGuard` default-on — explicit opt-out beats explicit opt-in for security.
- `RolesGuard` — reads `@Roles('ADMIN','STAFF')` metadata, checks `req.user.roles`.
- `PermissionsGuard` — finer-grained, checks `@RequirePermission('products.create')` against role_permissions for admin sub-actions.
- `RefreshTokenGuard` — separate strategy validating the refresh cookie against `refresh_tokens` table (not just JWT signature, since it must be revocable).
- `ThrottlerGuard` — global default + stricter overrides on `/auth/*`.
- `OwnerGuard`/manual service checks — e.g. `/orders/:id` verifies `order.user_id === req.user.id` unless caller has `orders.view_all` permission.

## 7. Frontend auth handling

- `AuthStore` (signal-based): `accessToken = signal<string|null>`, `user = signal<User|null>`, `isAuthenticated = computed(...)`. Access token kept **in memory only** (not localStorage) to reduce XSS blast radius; refresh cookie handles persistence across reloads via a silent `POST /auth/refresh` on app bootstrap (`APP_INITIALIZER`).
- `authInterceptor` (functional `HttpInterceptorFn`) attaches `Authorization` header; on `401`, queues the failed request, calls `/auth/refresh` once (single-flight via a shared `Observable`), retries, and on refresh failure clears `AuthStore` and redirects to `/auth/login?redirect=`.
- `authGuard` / `adminGuard` / `guestGuard` as functional `CanActivateFn`s reading `AuthStore` signals.
- SSR nuance: session restoration (`/auth/refresh`) only ever runs in the browser, never during SSR. Refresh tokens rotate on every use, and a server-side call's `Set-Cookie` lands on the SSR server's internal fetch response — not the real browser response — so it can never reach the browser's cookie jar. Calling refresh from both SSR and the client would race two rotations against the same cookie and the loser would be treated as token reuse, revoking the whole session. So: public pages (home, catalog, product detail) render logged-out on the server and personalize after hydration; authenticated-only routes (`/checkout`, `/cart`, `/wishlist`, `/account/**`) are configured `RenderMode.Client` in `app.routes.server.ts` so their guards never evaluate against an unresolved (always-"logged out") SSR auth state.
