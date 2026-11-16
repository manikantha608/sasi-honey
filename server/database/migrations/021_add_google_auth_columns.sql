-- Add Google OAuth and security columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id       VARCHAR(100) UNIQUE,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip   VARCHAR(45);

-- Index for Google lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Update existing verified users to have email_verified_at
UPDATE users
SET email_verified_at = created_at
WHERE email_verified = TRUE AND email_verified_at IS NULL;
