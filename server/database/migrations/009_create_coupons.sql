CREATE TABLE IF NOT EXISTS coupons (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  code                VARCHAR(50)   NOT NULL UNIQUE,
  description         TEXT,
  discount_type       VARCHAR(20)   NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value      NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(10,2),                     -- cap for percentage coupons
  usage_limit         INTEGER,                            -- NULL = unlimited
  usage_count         INTEGER       NOT NULL DEFAULT 0,
  per_user_limit      INTEGER       NOT NULL DEFAULT 1,
  starts_at           TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,
  is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code      ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
