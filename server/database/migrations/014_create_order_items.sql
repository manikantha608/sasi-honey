-- Price snapshot: stores prices as they were at order time, not live values
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id      UUID          NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  product_id      UUID          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- Snapshot fields
  product_name    VARCHAR(200)  NOT NULL,
  variant_label   VARCHAR(50)   NOT NULL,
  sku             VARCHAR(100)  NOT NULL,
  unit_price      NUMERIC(10,2) NOT NULL,
  quantity        INTEGER       NOT NULL CHECK (quantity > 0),
  total_price     NUMERIC(10,2) NOT NULL,

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);
