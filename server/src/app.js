import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import passport from './config/passport.js';
import bullBoardRouter from './config/bullBoard.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

dotenv.config();

const app = express();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // configure separately if serving HTML
  })
);

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.ADMIN_URL  || 'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parser (must be before routes) ───────────────────────────────────
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Passport (session: false — we use stateless JWT) ────────────────────────
app.use(passport.initialize());

// ─── Bull Board (queue dashboard — development only) ─────────────────────────
app.use('/admin/queues', bullBoardRouter.getRouter());

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    service: 'sasi-honey-api',
    timestamp: new Date().toISOString(),
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Dev queue test route — REMOVE before production ─────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.post('/dev/test-queue', async (req, res) => {
    const { type = 'email' } = req.query;
    const {
      enqueueVerificationEmail,
      enqueuePasswordResetEmail,
      enqueueWelcomeEmail,
      enqueueAdminOrderNotification,
      enqueueLowStockAlert,
    } = await import('./queues/index.js');

    let job;
    switch (type) {
      case 'verification':
        job = await enqueueVerificationEmail('demo@example.com', 'Demo User', 'token-abc123'); break;
      case 'password_reset':
        job = await enqueuePasswordResetEmail('demo@example.com', 'Demo User', 'reset-xyz'); break;
      case 'welcome':
        job = await enqueueWelcomeEmail('demo@example.com', 'Demo User'); break;
      case 'order':
        job = await enqueueAdminOrderNotification('order-42', 1499); break;
      case 'inventory':
        job = await enqueueLowStockAlert('prod-1', 'var-1', 2); break;
      default:
        return res.status(400).json({ error: `Unknown type. Use: verification, password_reset, welcome, order, inventory` });
    }
    res.json({ ok: true, jobId: job.id, queue: type });
  });
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
