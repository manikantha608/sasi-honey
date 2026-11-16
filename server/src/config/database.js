import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Keep a small pool for development; tune for production
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verify connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  PostgreSQL connection error:', err.message);
    return;
  }
  console.log('✅  PostgreSQL connected');
  release();
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * Execute a single query.
 * @param {string} text  SQL string (use $1, $2 … for parameters)
 * @param {Array}  params  Bound parameter values
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Obtain a dedicated client for multi-statement transactions.
 * Always call client.release() in a finally block.
 */
export const getClient = () => pool.connect();

export default pool;
