-- Each row represents one weight/size variant of a product (e.g. 250g, 500g, 1kg)
CREATE TABLE IF NOT EXISTS product_variants (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight_grams  INTEGER       NOT NULL,                   -- e.g. 250, 500, 1000
  label         VARCHAR(50)   NOT NULL,                   -- e.g. '250g', '500g', '1kg'
  price         NUMERIC(10,2) NOT NULL,                   -- in INR
  mrp           NUMERIC(10,2) NOT NULL,                   -- for showing discount %
  sku           VARCHAR(100)  NOT NULL UNIQUE,
  stock_qty     INTEGER       NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pv_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_pv_sku        ON product_variants(sku);
