# AtarLab — Database Schema (PostgreSQL)

Naming: `snake_case` tables/columns, singular-plural per Postgres convention (`products`, not `product`). All tables have `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (via `pgcrypto`/`pg_uuid_ossp`), `created_at`/`updated_at TIMESTAMPTZ DEFAULT now()`, and soft-delete `deleted_at TIMESTAMPTZ NULL` where history matters (users, products, orders). TypeORM migrations are the source of truth; this doc + `docs/er-diagram.txt` must stay in sync with them.

## 1. ER Diagram (text)

```
users ──< addresses
users ──< refresh_tokens
users ──< otps
users >──< roles  (via user_roles)
roles >──< permissions  (via role_permissions)

brands ──< products
categories ──< categories (self, parent_id)   -- nested categories
categories ──< products
products ──< product_variants
products ──< product_images >── product_variants (nullable variant_id)
products ──< fragrance_notes
products ──< product_ingredients
product_variants ──< inventory_movements
products ──< reviews >── users
products ──< wishlists >── users
products/variants ──< cart_items >── carts >── users (nullable, supports guest via session_id)

coupons ──< coupon_redemptions >── orders, users
offers >── categories/brands/products (nullable FKs, one applies)

users ──< orders
addresses ──< orders (shipping_address_id, billing_address_id)
coupons ──< orders (nullable)
orders ──< order_items >── product_variants
orders ──< order_status_history
orders ──< invoices (1:1)
orders ──< payments
orders ──< order_deliveries >── delivery_agents

users ──< notifications (nullable = broadcast)
banners, blogs, faqs, testimonials, instagram_feed, newsletter_subscribers  -- standalone content tables
activity_logs >── users (actor)
settings  -- key/value singleton config
```

## 2. Identity & Access

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             CITEXT UNIQUE,
  phone             VARCHAR(20) UNIQUE,
  password_hash     VARCHAR(255),              -- null for social-only accounts
  full_name         VARCHAR(150) NOT NULL,
  avatar_url        VARCHAR(500),
  google_id         VARCHAR(100) UNIQUE,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  CONSTRAINT chk_identifier CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE roles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(50) UNIQUE NOT NULL, description VARCHAR(255));
-- seeded: SUPER_ADMIN, ADMIN, STAFF, CUSTOMER

CREATE TABLE permissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) UNIQUE NOT NULL, module VARCHAR(50) NOT NULL);
-- e.g. 'products.create', 'orders.refund', 'reports.view'

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  user_agent VARCHAR(255), ip VARCHAR(45),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

CREATE TABLE otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(150) NOT NULL,             -- email or phone
  code_hash VARCHAR(255) NOT NULL,
  purpose VARCHAR(30) NOT NULL,                 -- REGISTER | LOGIN | RESET_PASSWORD | VERIFY_PHONE
  attempts SMALLINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_otps_identifier_purpose ON otps(identifier, purpose);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(30) DEFAULT 'Home',
  full_name VARCHAR(150) NOT NULL, phone VARCHAR(20) NOT NULL,
  line1 VARCHAR(255) NOT NULL, line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL, state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(12) NOT NULL, country VARCHAR(2) NOT NULL DEFAULT 'IN',
  lat NUMERIC(9,6), lng NUMERIC(9,6),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);
```

## 3. Catalog

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, slug VARCHAR(120) UNIQUE NOT NULL,
  logo_url VARCHAR(500), description TEXT, is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL, slug VARCHAR(120) UNIQUE NOT NULL,
  image_url VARCHAR(500), sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL, slug VARCHAR(220) UNIQUE NOT NULL,
  short_description VARCHAR(500), description TEXT,
  gender VARCHAR(10) NOT NULL DEFAULT 'UNISEX',      -- MALE | FEMALE | UNISEX
  concentration VARCHAR(20),                          -- ATTAR | EDP | EDT | OIL
  longevity VARCHAR(20),                               -- WEAK..ETERNAL
  projection VARCHAR(20),                               -- INTIMATE..ENORMOUS
  season TEXT[],                                        -- {SUMMER,WINTER,...}
  occasion TEXT[],                                       -- {DAILY,OFFICE,PARTY,WEDDING}
  base_price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  search_vector TSVECTOR,                                -- generated column, GIN indexed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_active AND deleted_at IS NULL;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(50) UNIQUE NOT NULL,
  size_ml INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  weight_grams INT,
  is_active BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL, alt_text VARCHAR(200), sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE fragrance_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  note_type VARCHAR(10) NOT NULL,                        -- TOP | MIDDLE | BASE
  name VARCHAR(100) NOT NULL, sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_notes_product ON fragrance_notes(product_id);

CREATE TABLE product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  change_qty INT NOT NULL,                               -- negative for deduction
  reason VARCHAR(30) NOT NULL,                            -- PURCHASE | RESTOCK | ADJUSTMENT | ORDER | RETURN
  reference_type VARCHAR(30), reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_inventory_variant ON inventory_movements(variant_id);
```

## 4. Reviews & Wishlist

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,  -- non-null => verified purchase
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150), comment TEXT, images TEXT[],
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id, order_item_id)
);
CREATE INDEX idx_reviews_product ON reviews(product_id) WHERE is_approved;

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);
```

## 5. Cart, Coupons, Offers

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(100),                               -- guest cart
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  gift_wrap BOOLEAN NOT NULL DEFAULT false,
  note VARCHAR(300),
  UNIQUE(cart_id, variant_id)
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL,                              -- PERCENTAGE | FIXED
  value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  usage_limit INT, used_count INT NOT NULL DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL, description VARCHAR(500), banner_image VARCHAR(500),
  discount_type VARCHAR(10) NOT NULL, discount_value NUMERIC(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT true
);
```

## 6. Orders, Payments, Delivery

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,               -- e.g. ATR-2026-000123
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',          -- PENDING|CONFIRMED|PACKED|PICKED|SHIPPED|OUT_FOR_DELIVERY|DELIVERED|CANCELLED|RETURNED
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING|PAID|FAILED|REFUNDED
  payment_method VARCHAR(20) NOT NULL,                     -- RAZORPAY|STRIPE|COD|UPI|WALLET
  shipping_address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  billing_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  subtotal NUMERIC(10,2) NOT NULL, discount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0, tax_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  gift_wrap BOOLEAN NOT NULL DEFAULT false, order_note VARCHAR(300),
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(), cancelled_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_number ON orders(order_number);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_name_snapshot VARCHAR(200) NOT NULL,             -- immutable record even if product changes/deleted
  variant_snapshot VARCHAR(100) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL, quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL, note VARCHAR(300),
  changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_status_history_order ON order_status_history(order_id);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(30) UNIQUE NOT NULL, pdf_url VARCHAR(500),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL,                           -- RAZORPAY|STRIPE|COD
  provider_order_id VARCHAR(100), provider_payment_id VARCHAR(100),
  amount NUMERIC(10,2) NOT NULL, currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED',           -- CREATED|AUTHORIZED|CAPTURED|FAILED|REFUNDED
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON payments(order_id);

CREATE TABLE delivery_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, phone VARCHAR(20) NOT NULL,
  vehicle_number VARCHAR(20), photo_url VARCHAR(500)
);

CREATE TABLE order_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_agent_id UUID REFERENCES delivery_agents(id) ON DELETE SET NULL,
  current_lat NUMERIC(9,6), current_lng NUMERIC(9,6),
  eta TIMESTAMPTZ, status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

`orders.status` and `order_deliveries.status` share the same enum: `ORDER_CONFIRMED → PACKED → PICKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED` (plus `CANCELLED`/`RETURNED` side-branches). Every transition is appended to `order_status_history` and emitted over the `/tracking` Socket.IO namespace to room `order:{orderId}`.

## 7. Content, Notifications, Admin

```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150), image_url VARCHAR(500) NOT NULL, link_url VARCHAR(500),
  position VARCHAR(20) NOT NULL,                            -- HERO|STRIP|POPUP|CATEGORY
  sort_order INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL, slug VARCHAR(220) UNIQUE NOT NULL,
  cover_image VARCHAR(500), content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false, published_at TIMESTAMPTZ
);

CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question VARCHAR(300) NOT NULL, answer TEXT NOT NULL,
  category VARCHAR(50), sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100) NOT NULL, photo_url VARCHAR(500),
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5), content TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE instagram_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url VARCHAR(500) NOT NULL, post_url VARCHAR(500), caption VARCHAR(300), sort_order INT DEFAULT 0
);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(), unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,      -- NULL = broadcast to all
  title VARCHAR(150) NOT NULL, body VARCHAR(500) NOT NULL,
  type VARCHAR(30) NOT NULL,                                 -- ORDER|PROMO|SYSTEM
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,                              -- e.g. 'product.update'
  entity_type VARCHAR(50) NOT NULL, entity_id UUID,
  before JSONB, after JSONB, ip VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 8. Business-rule constraints worth calling out

- `order_items.variant_id` is `RESTRICT` (never cascade-delete) — order history must survive product/variant deletion; product name/variant snapshots are denormalized onto the row for the same reason.
- `products.deleted_at` (soft delete) rather than hard delete — reviews/order history/wishlists reference products long after they're delisted.
- Stock decrement happens via `inventory_movements` insert + `product_variants.stock_quantity` update inside one DB transaction when an order is confirmed/paid — never a bare `UPDATE` from the checkout request without the movement audit row.
- `reviews` unique constraint on `(product_id, user_id, order_item_id)` enforces one review per purchased line item, while still allowing an unverified (non-purchase) review path if `order_item_id IS NULL` is permitted by business policy (toggle via `settings`).
- Money columns are `NUMERIC(10,2)`, never `FLOAT`.
- All list endpoints that back infinite scroll / admin tables are indexed for their default sort (`created_at DESC`) plus their filter columns — see per-table indexes above.
