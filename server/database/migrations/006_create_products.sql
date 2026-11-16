CREATE TABLE IF NOT EXISTS products (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name            VARCHAR(200)  NOT NULL,
  slug            VARCHAR(220)  NOT NULL UNIQUE,
  description     TEXT,
  short_desc      TEXT,
  -- Base price in paise (smallest currency unit); actual prices are on variants
  is_featured     BOOLEAN       NOT NULL DEFAULT FALSE,
  is_bestseller   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  meta_title      VARCHAR(200),
  meta_desc       TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug         ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active    ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured  ON products(is_featured);
