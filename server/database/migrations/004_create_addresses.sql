CREATE TABLE IF NOT EXISTS addresses (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name     VARCHAR(150) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  address_line1 TEXT         NOT NULL,
  address_line2 TEXT,
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  pincode       VARCHAR(10)  NOT NULL,
  country       VARCHAR(80)  NOT NULL DEFAULT 'India',
  is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
