/**
 * Bull Board — UI dashboard for BullMQ queues.
 * Mounted at /admin/queues (dev only by default).
 *
 * Open http://localhost:5000/admin/queues in your browser to view the dashboard.
 */
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import {
  emailQueue,
  orderQueue,
  inventoryQueue,
  notificationQueue,
} from '../queues/index.js';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(orderQueue),
    new BullMQAdapter(inventoryQueue),
    new BullMQAdapter(notificationQueue),
  ],
  serverAdapter,
});

export default serverAdapter;
