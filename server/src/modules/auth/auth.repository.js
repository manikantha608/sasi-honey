/**
 * Auth Repository — all raw SQL queries for the auth module.
 * No business logic lives here — only data access.
 */
import { query, getClient } from '../../config/database.js';

// ─────────────────────────────────────────────────────────────────────────────
// User queries
// ─────────────────────────────────────────────────────────────────────────────

export const findUserByEmail = async (email) => {
  const { rows } = await query(
    `SELECT id, name, email, phone, password_hash, role, is_active,
            email_verified, avatar_url, created_at
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await query(
    `SELECT id, name, email, phone, role, is_active,
            email_verified, avatar_url, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

export const createUser = async ({ name, email, phone, passwordHash, role = 'customer' }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role, is_active, email_verified, created_at`,
    [name, email.toLowerCase(), phone || null, passwordHash, role]
  );
  return rows[0];
};

export const updateUserEmailVerified = async (userId) => {
  await query(
    `UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = $1`,
    [userId]
  );
};

export const updateUserPassword = async (userId, passwordHash) => {
  await query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
    [passwordHash, userId]
  );
};

export const updateUserAvatar = async (userId, avatarUrl) => {
  const { rows } = await query(
    `UPDATE users SET avatar_url = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, avatar_url`,
    [avatarUrl, userId]
  );
  return rows[0];
};

/**
 * Upsert a Google OAuth user — create if new, return existing if found.
 * Uses a transaction to prevent race conditions.
 */
export const upsertGoogleUser = async ({ name, email, avatarUrl, googleId }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Try to find existing user by email
    const { rows: existing } = await client.query(
      `SELECT id, name, email, phone, role, is_active, email_verified, avatar_url
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (existing[0]) {
      // If user exists but email_verified is false, mark it verified (Google confirms the email)
      if (!existing[0].email_verified) {
        await client.query(
          `UPDATE users SET email_verified = TRUE, avatar_url = COALESCE(avatar_url, $1), updated_at = NOW()
           WHERE id = $2`,
          [avatarUrl, existing[0].id]
        );
        existing[0].email_verified = true;
        existing[0].avatar_url = existing[0].avatar_url || avatarUrl;
      }
      await client.query('COMMIT');
      return { user: existing[0], isNew: false };
    }

    // Create new user — Google users have no password, set a random unusable hash
    const { rows: created } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, email_verified, avatar_url)
       VALUES ($1, $2, $3, 'customer', TRUE, $4)
       RETURNING id, name, email, phone, role, is_active, email_verified, avatar_url`,
      [name, email.toLowerCase(), `google_oauth_${googleId}`, avatarUrl || null]
    );

    await client.query('COMMIT');
    return { user: created[0], isNew: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Refresh token queries
// ─────────────────────────────────────────────────────────────────────────────

export const saveRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

export const findRefreshToken = async (tokenHash) => {
  const { rows } = await query(
    `SELECT rt.id, rt.user_id, rt.expires_at,
            u.id as uid, u.name, u.email, u.role, u.is_active, u.email_verified
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1`,
    [tokenHash]
  );
  return rows[0] || null;
};

export const deleteRefreshToken = async (tokenHash) => {
  await query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
};

/**
 * Atomically claim (delete) a refresh token and return it with user data.
 * Uses a CTE so the DELETE and the user JOIN happen in a single round-trip.
 * This prevents two concurrent requests from both passing a find() check
 * before either has deleted the row — only the first caller gets a row back.
 */
export const claimRefreshToken = async (tokenHash) => {
  const { rows } = await query(
    `WITH claimed AS (
       DELETE FROM refresh_tokens
       WHERE token_hash = $1
       RETURNING id, user_id, expires_at
     )
     SELECT c.id, c.user_id, c.expires_at,
            u.email, u.role, u.is_active
     FROM claimed c
     JOIN users u ON u.id = c.user_id`,
    [tokenHash]
  );
  return rows[0] || null;
};

export const deleteAllUserRefreshTokens = async (userId) => {
  await query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [userId]);
};

export const cleanExpiredRefreshTokens = async () => {
  await query(`DELETE FROM refresh_tokens WHERE expires_at < NOW()`);
};
