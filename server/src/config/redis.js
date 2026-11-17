/**
 * Redis client with graceful degradation.
 *
 * Attempts to connect to Redis on startup. If Redis is not reachable it falls
 * back to an in-memory store so the server keeps running in development.
 * In production Redis should always be available.
 */
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// ─── In-memory fallback ───────────────────────────────────────────────────────
class MemoryStore {
  constructor() {
    this._store = new Map(); // key → { value, expiresAt }
    // Clean up expired keys every 60 seconds
    setInterval(() => this._purge(), 60_000).unref();
  }

  _purge() {
    const now = Date.now();
    for (const [key, entry] of this._store) {
      if (entry.expiresAt && entry.expiresAt <= now) this._store.delete(key);
    }
  }

  _isExpired(entry) {
    return entry.expiresAt && entry.expiresAt <= Date.now();
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry || this._isExpired(entry)) { this._store.delete(key); return null; }
    return entry.value;
  }

  async set(key, value) {
    this._store.set(key, { value, expiresAt: null });
    return 'OK';
  }

  async setex(key, seconds, value) {
    this._store.set(key, { value: String(value), expiresAt: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async del(...keys) {
    let count = 0;
    for (const k of keys) { if (this._store.delete(k)) count++; }
    return count;
  }

  async incr(key) {
    const entry = this._store.get(key);
    const current = entry && !this._isExpired(entry) ? Number(entry.value) : 0;
    const next = current + 1;
    this._store.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
    return next;
  }

  async expire(key, seconds) {
    const entry = this._store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async exists(...keys) {
    return keys.filter((k) => {
      const e = this._store.get(k);
      return e && !this._isExpired(e);
    }).length;
  }

  async quit() { this._store.clear(); return 'OK'; }
  async disconnect() { return this.quit(); }
  on() { return this; } // no-op event emitter shim
}

// ─── Real Redis client ────────────────────────────────────────────────────────
let usingFallback = false;

const buildRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 200, 2000);
    },
    enableOfflineQueue: false,
  });

  client.on('connect', () => {
    usingFallback = false;
    console.log('✅  Redis connected');
  });

  client.on('error', (err) => {
    if (!usingFallback) {
      usingFallback = true;
      console.warn(`⚠️   Redis error (${err.message}). Switching to in-memory fallback.`);
    }
  });

  return client;
};

// ─── Connect on startup ───────────────────────────────────────────────────────
export const realClient = buildRedisClient();
const fallback = new MemoryStore();

export const connectRedis = async () => {
  try {
    await realClient.connect();
  } catch (err) {
    usingFallback = true;
    console.warn(`⚠️   Redis not reachable (${err.message}). Running with in-memory token store.`);
  }
};

// ─── Proxy — routes all calls to real Redis or fallback ───────────────────────
const redis = new Proxy(
  {},
  {
    get(_, method) {
      return (...args) => {
        const target = usingFallback ? fallback : realClient;
        if (typeof target[method] === 'function') {
          return target[method](...args);
        }
        return target[method];
      };
    },
  }
);

// ─── BullMQ connection config ─────────────────────────────────────────────────
// BullMQ manages its own ioredis connections internally — pass a config object,
// not the shared proxy, so it can create subscriber/blocking connections freely.
export const bullmqConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
};

// ─── Cache TTLs (seconds) ─────────────────────────────────────────────────────
export const TTL = {
  PRODUCT: 60 * 10,   // 10 min
  CATEGORY: 60 * 30,  // 30 min
  OTP: 60 * 10,       // 10 min
  RATE_LIMIT: 60 * 15, // 15 min window
};

export const isRedisAvailable = () => !usingFallback;

export default redis;
