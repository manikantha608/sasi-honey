/**
 * BullMQ queues — disabled while Redis is disconnected.
 * TODO: uncomment when Redis is available.
 */

// import { Queue } from 'bullmq';
// import { realClient as connection } from '../config/redis.js';
//
// export const emailQueue        = new Queue('email',        { connection });
// export const orderQueue        = new Queue('order',        { connection });
// export const inventoryQueue    = new Queue('inventory',    { connection });
// export const notificationQueue = new Queue('notification', { connection });
//
// console.log('✅  BullMQ queues initialised');

// ─── Stub exports so imports don't break ─────────────────────────────────────
export const emailQueue        = null;
export const orderQueue        = null;
export const inventoryQueue    = null;
export const notificationQueue = null;
