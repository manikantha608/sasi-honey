CREATE TABLE IF NOT EXISTS users (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  phone           VARCHAR(20),
  password_hash   TEXT          NOT NULL,
  role            VARCHAR(20)   NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('customer', 'admin')),
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  email_verified  BOOLEAN       NOT NULL DEFAULT FALSE,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
