import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import passport from './config/passport.js';
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

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // allow cookies from frontend
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

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
