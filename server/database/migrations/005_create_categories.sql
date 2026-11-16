CREATE TABLE IF NOT EXISTS categories (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order  INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug      ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
