/**
 * BullMQ queues.
 *
 * Each queue is backed by its own BullMQ connection (ioredis config).
 * Workers run in the same process during development; move to a separate
 * worker process in production if needed.
 *
 * Usage:
 *   import { emailQueue } from '../queues/index.js';
 *   await emailQueue.add('verification', { to, name, token });
 */
import { Queue } from 'bullmq';
import { bullmqConnection } from '../config/redis.js';

// ─── Default job options ───────────────────────────────────────────────────────
const defaultJobOptions = {
  attempts: 3,                      // retry up to 3 times on failure
  backoff: { type: 'exponential', delay: 2000 }, // 2s → 4s → 8s
  removeOnComplete: { count: 100 }, // keep last 100 completed jobs
  removeOnFail: { count: 200 },     // keep last 200 failed jobs for inspection
};

// ─── Queues ───────────────────────────────────────────────────────────────────
export const emailQueue = new Queue('email', {
  connection: bullmqConnection,
  defaultJobOptions,
});

export const orderQueue = new Queue('order', {
  connection: bullmqConnection,
  defaultJobOptions,
});

export const inventoryQueue = new Queue('inventory', {
  connection: bullmqConnection,
  defaultJobOptions,
});

export const notificationQueue = new Queue('notification', {
  connection: bullmqConnection,
  defaultJobOptions,
});

console.log('✅  BullMQ queues initialised');

// ─── Email job helpers ────────────────────────────────────────────────────────
// Convenience wrappers so callers don't need to remember job names.

export const enqueueVerificationEmail = (to, name, token) =>
  emailQueue.add('verification', { to, name, token });

export const enqueuePasswordResetEmail = (to, name, token) =>
  emailQueue.add('password_reset', { to, name, token });

export const enqueueWelcomeEmail = (to, name) =>
  emailQueue.add('welcome', { to, name });

export const enqueueOtpEmail = (to, name, otp) =>
  emailQueue.add('otp', { to, name, otp });

export const enqueueOrderConfirmationEmail = (to, name, order) =>
  emailQueue.add('order_confirmation', { to, name, order });

export const enqueuePaymentConfirmationEmail = (to, name, payment) =>
  emailQueue.add('payment_confirmation', { to, name, payment });

export const enqueueShippingUpdateEmail = (to, name, shipping) =>
  emailQueue.add('shipping_update', { to, name, shipping });

// ─── Order job helpers ────────────────────────────────────────────────────────
export const enqueueInvoiceGeneration = (orderId, userId) =>
  orderQueue.add('invoice_generation', { orderId, userId });

export const enqueueAdminOrderNotification = (orderId, amount) =>
  orderQueue.add('admin_notification', { orderId, amount });

export const enqueuePostPaymentProcessing = (orderId, paymentId) =>
  orderQueue.add('post_payment', { orderId, paymentId });

// ─── Inventory job helpers ────────────────────────────────────────────────────
export const enqueueLowStockAlert = (productId, variantId, currentStock) =>
  inventoryQueue.add('low_stock_alert', { productId, variantId, currentStock });

export const enqueueStockAlert = (productId, message) =>
  inventoryQueue.add('stock_alert', { productId, message });
