/**
 * Inventory Worker
 *
 * Processes background inventory tasks through the 'inventory' BullMQ queue.
 * Runs with concurrency 2.
 *
 * Job types:
 *   low_stock_alert  → alert admin when a variant stock falls below threshold
 *   stock_alert      → general product-level stock alert
 */
import { Worker } from 'bullmq';
import { bullmqConnection } from '../config/redis.js';
import { query } from '../config/database.js';

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

// ─── Job processor ────────────────────────────────────────────────────────────
const processInventoryJob = async (job) => {
  switch (job.name) {

    case 'low_stock_alert': {
      const { productId, variantId, currentStock } = job.data;

      // Fetch product + variant name for the alert message
      const { rows } = await query(
        `SELECT p.name AS product_name, pv.name AS variant_name
         FROM product_variants pv
         JOIN products p ON p.id = pv.product_id
         WHERE pv.id = $1`,
        [variantId]
      );
      const item = rows[0];
      if (!item) break;

      console.warn(
        `⚠️   LOW STOCK: "${item.product_name} – ${item.variant_name}" ` +
        `has only ${currentStock} unit(s) remaining (threshold: ${LOW_STOCK_THRESHOLD})`
      );
      // TODO: send admin email / push notification
      break;
    }

    case 'stock_alert': {
      const { productId, message } = job.data;
      console.warn(`⚠️   STOCK ALERT for product #${productId}: ${message}`);
      // TODO: notify admin
      break;
    }

    default:
      throw new Error(`Unknown inventory job type: ${job.name}`);
  }
};

// ─── Worker ───────────────────────────────────────────────────────────────────
const inventoryWorker = new Worker('inventory', processInventoryJob, {
  connection: bullmqConnection,
  concurrency: 2,
});

inventoryWorker.on('completed', (job) =>
  console.log(`📊  Inventory job [${job.name}] ✅  (job ${job.id})`)
);

inventoryWorker.on('failed', (job, err) =>
  console.error(`📊  Inventory job [${job?.name}] failed (job ${job?.id}): ${err.message}`)
);

inventoryWorker.on('error', (err) =>
  console.error('📊  Inventory worker error:', err.message)
);

export default inventoryWorker;
