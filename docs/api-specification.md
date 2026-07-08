# AtarLab — API Specification (REST + WebSocket)

Base URL: `/api/v1`. Auth: `Authorization: Bearer <access_token>` unless marked **Public**. Response envelope: `{ success: boolean, data: T, meta?: { page, limit, total } }`. Errors: `{ success: false, error: { code, message, details? } }` (via `AllExceptionsFilter`).

## Auth — `/auth`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | Public | email/phone + password → sends verification OTP/email |
| POST | `/auth/login` | Public | returns access (15m) + refresh (7d, httpOnly cookie) token pair |
| POST | `/auth/otp/request` | Public | purpose: REGISTER\|LOGIN\|VERIFY_PHONE, rate-limited per identifier |
| POST | `/auth/otp/verify` | Public | consumes OTP, issues tokens if purpose=LOGIN/REGISTER |
| GET | `/auth/google` | Public | redirects to Google OAuth consent |
| GET | `/auth/google/callback` | Public | exchanges code, creates/links user, redirects to frontend with tokens |
| POST | `/auth/refresh` | Refresh cookie | rotates refresh token (reuse-detection revokes family) |
| POST | `/auth/logout` | Bearer | revokes current refresh token |
| POST | `/auth/forgot-password` | Public | emails reset link/OTP |
| POST | `/auth/reset-password` | Public | token + new password |
| GET | `/auth/verify-email` | Public | token from email link |
| GET | `/auth/me` | Bearer | current user profile + roles |

## Users & Addresses — `/users`, `/addresses`
| Method | Path | Auth |
|---|---|---|
| GET/PATCH | `/users/me` | Bearer |
| PATCH | `/users/me/password` | Bearer |
| GET/POST | `/addresses` | Bearer |
| PATCH/DELETE | `/addresses/:id` | Bearer (owner) |
| PATCH | `/addresses/:id/default` | Bearer (owner) |

## Catalog — `/categories`, `/brands`, `/products`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/categories` | Public | tree or flat (`?flat=true`) |
| GET | `/brands` | Public | |
| GET | `/products` | Public | filters: `category, brand, gender, concentration, season, occasion, minPrice, maxPrice, rating`; sort: `newest, price_asc, price_desc, rating, bestseller`; pagination |
| GET | `/products/:slug` | Public | full detail incl. variants, notes, ingredients, images, related, frequently-bought-together |
| GET | `/products/:slug/reviews` | Public | paginated, approved only |
| POST | `/products/:slug/reviews` | Bearer | one per purchased order-item |
| GET | `/search/suggest?q=` | Public | instant-suggestions (typeahead, debounced), returns products+categories+brands |
| GET | `/search?q=` | Public | full results w/ filters, same shape as `/products` |

## Cart — `/cart`
| Method | Path | Auth |
|---|---|---|
| GET | `/cart` | Bearer or guest `X-Session-Id` header |
| POST | `/cart/items` | Bearer/guest — `{variantId, quantity, giftWrap?, note?}` |
| PATCH | `/cart/items/:id` | Bearer/guest |
| DELETE | `/cart/items/:id` | Bearer/guest |
| POST | `/cart/merge` | Bearer | merges guest session cart into user cart post-login |
| POST | `/cart/coupon` | Bearer/guest | `{code}` → validates & applies |
| DELETE | `/cart/coupon` | Bearer/guest |
| GET | `/cart/summary` | Bearer/guest | subtotal, discount, shipping estimate, tax, grand total |

## Wishlist — `/wishlist`
| Method | Path | Auth |
|---|---|---|
| GET/POST | `/wishlist` | Bearer |
| DELETE | `/wishlist/:id` | Bearer |
| POST | `/wishlist/:id/move-to-cart` | Bearer |

## Checkout & Orders — `/orders`, `/payments`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/orders/checkout` | Bearer | validates stock+coupon, creates `orders` (PENDING) + `payments` (CREATED); for Razorpay returns `provider_order_id` for client SDK |
| POST | `/payments/razorpay/verify` | Bearer | verifies signature server-side → marks paid, transitions order to CONFIRMED, decrements stock atomically |
| POST | `/payments/razorpay/webhook` | Public (signed) | source of truth for async payment events, idempotent by `provider_payment_id` |
| POST | `/payments/stripe/webhook` | Public (signed) | optional gateway |
| GET | `/orders` | Bearer | current user's orders, paginated |
| GET | `/orders/:id` | Bearer (owner) | items, status history, invoice link |
| GET | `/orders/:id/invoice` | Bearer (owner) | PDF stream/URL |
| POST | `/orders/:id/cancel` | Bearer (owner) | only if status in PENDING/CONFIRMED |
| GET | `/orders/:id/tracking` | Bearer (owner) | current delivery snapshot (agent, eta, lat/lng, status) |

## Admin — `/admin/*` (Bearer + `RolesGuard(ADMIN|STAFF)` + per-route `PermissionsGuard`)
| Resource | Endpoints |
|---|---|
| Dashboard | `GET /admin/dashboard/summary`, `GET /admin/dashboard/revenue?range=` |
| Products | full CRUD `/admin/products`, `POST /admin/products/:id/images`, `PATCH /admin/products/:id/variants/:variantId` |
| Categories/Brands | full CRUD `/admin/categories`, `/admin/brands` |
| Banners | full CRUD `/admin/banners` |
| Coupons/Offers | full CRUD `/admin/coupons`, `/admin/offers` |
| Inventory | `GET /admin/inventory`, `POST /admin/inventory/adjust` |
| Customers | `GET /admin/customers`, `GET /admin/customers/:id`, `PATCH /admin/customers/:id/status` |
| Orders | `GET /admin/orders`, `PATCH /admin/orders/:id/status` (emits socket update), `POST /admin/orders/:id/refund` |
| Reviews | `GET /admin/reviews?status=pending`, `PATCH /admin/reviews/:id/approve\|reject` |
| Reports | `GET /admin/reports/sales`, `/reports/top-products`, `/reports/customers` (add `?format=csv` for export) |
| Settings | `GET/PATCH /admin/settings` |
| Roles & Permissions | full CRUD `/admin/roles`, `GET /admin/permissions` |
| Activity Logs | `GET /admin/activity-logs?entityType=&actorUserId=` |
| Uploads | `POST /admin/uploads/image` (multipart `file`, returns `{url, publicId}`) |

Notifications (admin broadcast) is deferred past Phase 2 — not yet implemented.

## Content — `/blogs`, `/faqs`, `/testimonials`, `/instagram-feed`, `/newsletter`
All `GET` Public; admin CRUD variants live under `/admin/*` equivalents.

## WebSocket — namespace `/tracking`
| Event | Direction | Payload |
|---|---|---|
| `connect` (auth via handshake JWT) | client→server | |
| `join_order` | client→server | `{ orderId }` → joins room `order:{id}` (server verifies ownership) |
| `order_status_update` | server→client | `{ orderId, status, note, timestamp }` |
| `delivery_location_update` | server→client | `{ orderId, lat, lng, eta }` |
| `leave_order` | client→server | `{ orderId }` |

Admin order-status changes (`PATCH /admin/orders/:id/status`) and the delivery-agent location feed both flow through `TrackingGateway.emitToOrder(orderId, event, payload)`, which also persists to `order_status_history` before emitting — sockets never bypass the DB write.

## Global conventions
- Pagination: `?page=1&limit=20`, capped at `limit<=100`.
- Rate limiting: `@Throttle` on auth/OTP endpoints (5 req/min per IP+identifier).
- Idempotency: payment webhook handlers keyed by `provider_payment_id` (unique constraint) to survive retries.
- Full contract lives in `openapi.yaml` (generated from NestJS `@nestjs/swagger` decorators) served at `/api/docs` in non-production environments.
