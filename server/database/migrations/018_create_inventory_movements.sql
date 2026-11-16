-- Tracks every stock change for audit and reporting
CREATE TABLE IF NOT EXISTS inventory_movements (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id    UUID        NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  order_id      UUID        REFERENCES orders(id) ON DELETE SET NULL,
  movement_type VARCHAR(30) NOT NULL
                            CHECK (movement_type IN (
                              'purchase', 'sale', 'return', 'adjustment', 'manual'
                            )),
  quantity      INTEGER     NOT NULL,     -- positive = stock in, negative = stock out
  stock_before  INTEGER     NOT NULL,
  stock_after   INTEGER     NOT NULL,
  notes         TEXT,
  created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_movements_variant_id ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_order_id   ON inventory_movements(order_id);
