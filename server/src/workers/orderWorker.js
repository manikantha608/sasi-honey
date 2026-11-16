/**
 * Order worker — disabled while Redis is disconnected.
 * TODO: uncomment when Redis is available.
 */

// import { Worker } from 'bullmq';
// import { realClient as connection } from '../config/redis.js';
//
// const orderWorker = new Worker(
//   'order',
//   async (job) => {
//     const { type, data } = job.data;
//     console.log(`📦  Processing order job [${type}]`);
//     switch (type) {
//       case 'invoice_generation': break;
//       case 'admin_notification':  break;
//       case 'post_payment':        break;
//       default: console.warn(`Unknown order job type: ${type}`);
//     }
//   },
//   { connection, concurrency: 3 }
// );
//
// orderWorker.on('completed', (job) => console.log(`✅  Order job ${job.id} completed`));
// orderWorker.on('failed', (job, err) => console.error(`❌  Order job ${job?.id} failed:`, err.message));
//
// export default orderWorker;

export default null;
