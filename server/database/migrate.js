/**
 * Simple sequential migration runner.
 * Reads all .sql files from migrations/ in alphabetical order and executes them.
 * Tracks applied migrations in a `schema_migrations` table.
 *
 * Usage: node database/migrate.js
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // Get already-applied migrations
    const { rows } = await client.query('SELECT filename FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.filename));

    // Read migration files
    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let count = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  ⏭   Skipping (already applied): ${file}`);
        continue;
      }

      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✅  Applied: ${file}`);
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌  Failed: ${file}\n     ${err.message}`);
        process.exit(1);
      }
    }

    console.log(`\n🎉  Migration complete — ${count} migration(s) applied.`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration runner error:', err);
  process.exit(1);
});
