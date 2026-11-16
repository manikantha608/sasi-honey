/**
 * Inventory worker — disabled while Redis is disconnected.
 * TODO: uncomment when Redis is available.
 */

// import { Worker } from 'bullmq';
// import { realClient as connection } from '../config/redis.js';
//
// const inventoryWorker = new Worker(
//   'inventory',
//   async (job) => {
//     const { type, data } = job.data;
//     console.log(`📊  Processing inventory job [${type}]`);
//     switch (type) {
//       case 'low_stock_alert': break;
//       case 'stock_alert':     break;
//       default: console.warn(`Unknown inventory job type: ${type}`);
//     }
//   },
//   { connection, concurrency: 2 }
// );
//
// inventoryWorker.on('completed', (job) => console.log(`✅  Inventory job ${job.id} completed`));
// inventoryWorker.on('failed', (job, err) => console.error(`❌  Inventory job ${job?.id} failed:`, err.message));
//
// export default inventoryWorker;

export default null;
