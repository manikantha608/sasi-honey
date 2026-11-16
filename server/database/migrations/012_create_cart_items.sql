CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     UUID        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id  UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id    ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);
