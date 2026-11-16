CREATE TABLE IF NOT EXISTS reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id    UUID        REFERENCES orders(id) ON DELETE SET NULL,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(200),
  body        TEXT,
  is_verified BOOLEAN     NOT NULL DEFAULT FALSE,  -- purchased verified review
  is_approved BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id  ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id     ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
