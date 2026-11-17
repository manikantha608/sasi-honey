/**
 * Email Worker
 *
 * Processes all outbound emails through the 'email' BullMQ queue.
 * Runs with concurrency 5 — up to 5 emails sent in parallel.
 *
 * Job types:
 *   verification        → account email verification link
 *   password_reset      → password reset link
 *   welcome             → welcome email for new Google OAuth users
 *   otp                 → one-time password
 *   order_confirmation  → order placed confirmation
 *   payment_confirmation→ payment received confirmation
 *   shipping_update     → order shipped / tracking update
 */
import { Worker } from 'bullmq';
import { bullmqConnection } from '../config/redis.js';
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOtpEmail,
} from '../utils/email.js';
import sendMail from '../utils/email.js';

// ─── Job processor ────────────────────────────────────────────────────────────
const processEmailJob = async (job) => {
  const { to, name } = job.data;

  switch (job.name) {

    case 'verification':
      await sendEmailVerification(to, name, job.data.token);
      break;

    case 'password_reset':
      await sendPasswordResetEmail(to, name, job.data.token);
      break;

    case 'welcome':
      await sendWelcomeEmail(to, name);
      break;

    case 'otp':
      await sendOtpEmail(to, name, job.data.otp);
      break;

    case 'order_confirmation': {
      const { order } = job.data;
      await sendMail({
        to,
        subject: `✅ Order Confirmed – #${order.id}`,
        html: `
          <h2>Hi ${name}, your order is confirmed!</h2>
          <p>Order ID: <strong>#${order.id}</strong></p>
          <p>Total: <strong>₹${order.total}</strong></p>
          <p>We'll notify you once your order ships.</p>
        `,
      });
      break;
    }

    case 'payment_confirmation': {
      const { payment } = job.data;
      await sendMail({
        to,
        subject: `💳 Payment Received – ₹${payment.amount}`,
        html: `
          <h2>Hi ${name}, payment received!</h2>
          <p>Amount: <strong>₹${payment.amount}</strong></p>
          <p>Transaction ID: <strong>${payment.transactionId}</strong></p>
          <p>Thank you for your purchase.</p>
        `,
      });
      break;
    }

    case 'shipping_update': {
      const { shipping } = job.data;
      await sendMail({
        to,
        subject: `🚚 Your order #${shipping.orderId} has shipped!`,
        html: `
          <h2>Hi ${name}, your order is on the way!</h2>
          <p>Order ID: <strong>#${shipping.orderId}</strong></p>
          ${shipping.trackingNumber ? `<p>Tracking: <strong>${shipping.trackingNumber}</strong></p>` : ''}
          ${shipping.carrier ? `<p>Carrier: <strong>${shipping.carrier}</strong></p>` : ''}
        `,
      });
      break;
    }

    default:
      throw new Error(`Unknown email job type: ${job.name}`);
  }
};

// ─── Worker ───────────────────────────────────────────────────────────────────
const emailWorker = new Worker('email', processEmailJob, {
  connection: bullmqConnection,
  concurrency: 5,
});

emailWorker.on('completed', (job) =>
  console.log(`📧  Email [${job.name}] → ${job.data.to} ✅  (job ${job.id})`)
);

emailWorker.on('failed', (job, err) =>
  console.error(`📧  Email [${job?.name}] failed (job ${job?.id}): ${err.message}`)
);

emailWorker.on('error', (err) =>
  console.error('📧  Email worker error:', err.message)
);

export default emailWorker;
