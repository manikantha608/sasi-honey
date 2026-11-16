import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import pool from './config/database.js';
import { connectRedis } from './config/redis.js';

// Redis connect is a no-op while disconnected — safe to call
await connectRedis();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀  Sasi Honey API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    // TODO: add redis.quit() here when Redis is re-enabled
    console.log('✅  Connections closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});
