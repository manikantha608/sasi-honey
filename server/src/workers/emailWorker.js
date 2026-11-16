/**
 * Email worker — disabled while Redis is disconnected.
 * TODO: uncomment when Redis is available.
 */

// import { Worker } from 'bullmq';
// import { realClient as connection } from '../config/redis.js';
//
// const emailWorker = new Worker(
//   'email',
//   async (job) => {
//     const { type, to, data } = job.data;
//     console.log(`📧  Processing email job [${type}] → ${to}`);
//     switch (type) {
//       case 'registration':        break;
//       case 'order_confirmation':  break;
//       case 'payment_confirmation':break;
//       case 'shipping_update':     break;
//       default: console.warn(`Unknown email job type: ${type}`);
//     }
//   },
//   { connection, concurrency: 5 }
// );
//
// emailWorker.on('completed', (job) => console.log(`✅  Email job ${job.id} completed`));
// emailWorker.on('failed', (job, err) => console.error(`❌  Email job ${job?.id} failed:`, err.message));
//
// export default emailWorker;

export default null;
