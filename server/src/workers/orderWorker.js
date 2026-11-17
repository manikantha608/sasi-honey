/**
 * Order Worker
 *
 * Processes background order tasks through the 'order' BullMQ queue.
 * Runs with concurrency 3.
 *
 * Job types:
 *   invoice_generation  → generate and store PDF invoice
 *   admin_notification  → notify admin of new order
 *   post_payment        → reserve stock, trigger fulfillment
 */
import { Worker } from 'bullmq';
import { bullmqConnection } from '../config/redis.js';
import { query } from '../config/database.js';

// ─── Job processor ────────────────────────────────────────────────────────────
const processOrderJob = async (job) => {
  switch (job.name) {

    case 'invoice_generation': {
      const { orderId, userId } = job.data;
      // TODO: generate PDF invoice and store via Cloudinary
      console.log(`📄  Invoice generation queued for order #${orderId}, user #${userId}`);
      break;
    }

    case 'admin_notification': {
      const { orderId, amount } = job.data;
      // TODO: send push/email notification to admin dashboard
      console.log(`🔔  Admin notification: new order #${orderId} — ₹${amount}`);
      break;
    }

    case 'post_payment': {
      const { orderId, paymentId } = job.data;
      // Mark order as paid in DB
      await query(
        `UPDATE orders SET status = 'confirmed', payment_id = $1, updated_at = NOW()
         WHERE id = $2 AND status = 'pending'`,
        [paymentId, orderId]
      );
      console.log(`✅  Post-payment processing complete for order #${orderId}`);
      break;
    }

    default:
      throw new Error(`Unknown order job type: ${job.name}`);
  }
};

// ─── Worker ───────────────────────────────────────────────────────────────────
const orderWorker = new Worker('order', processOrderJob, {
  connection: bullmqConnection,
  concurrency: 3,
});

orderWorker.on('completed', (job) =>
  console.log(`📦  Order job [${job.name}] ✅  (job ${job.id})`)
);

orderWorker.on('failed', (job, err) =>
  console.error(`📦  Order job [${job?.name}] failed (job ${job?.id}): ${err.message}`)
);

orderWorker.on('error', (err) =>
  console.error('📦  Order worker error:', err.message)
);

export default orderWorker;
