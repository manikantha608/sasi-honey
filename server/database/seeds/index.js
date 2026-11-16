/**
 * Master seed runner — executes all seed files in order.
 * Usage: node database/seeds/index.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Import seed modules
import { seedUsers } from './01_users.js';
import { seedCategories } from './02_categories.js';
import { seedProducts } from './03_products.js';
import { seedCoupons } from './04_coupons.js';

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱  Starting seed...\n');

    await seedUsers(client);
    await seedCategories(client);
    await seedProducts(client);
    await seedCoupons(client);

    console.log('\n🎉  Seeding complete!');
  } catch (err) {
    console.error('❌  Seed error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
