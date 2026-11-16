CREATE TABLE IF NOT EXISTS coupon_usage (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id  UUID        NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id   UUID,                   -- filled in after order is placed; FK added later
  used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, user_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id   ON coupon_usage(user_id);
