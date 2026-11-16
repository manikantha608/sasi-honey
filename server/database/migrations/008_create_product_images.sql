CREATE TABLE IF NOT EXISTS product_images (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url    TEXT        NOT NULL,
  public_id    TEXT        NOT NULL,          -- Cloudinary public_id for deletion
  alt_text     VARCHAR(200),
  is_primary   BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
