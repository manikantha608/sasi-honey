/**
 * Redis client with graceful degradation.
 *
 * In development, if Redis is not running the server continues to work using
 * an in-memory fallback store. Features that depend on Redis (email verify
 * tokens, brute-force counters, password-reset tokens) still function — they
 * just live in memory instead of a shared cache.
 *
 * In production you should always have Redis running. The fallback will log a
 * warning and function at reduced capacity (single-process only, no TTL
 * persistence across restarts).
 */
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// ─── In-memory fallback ───────────────────────────────────────────────────────
class MemoryStore {
  constructor() {
    this._store = new Map();   // key → { value, expiresAt }
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
  on() { return this; }  // no-op event emitter shim
}

// ─── Build the real Redis client ──────────────────────────────────────────────
// TODO: Set usingFallback = false and call connectRedis() when Redis is ready.
let usingFallback = true; // ← temporarily forced — Redis disconnected for now

/* -- Uncomment this entire block when Redis is available --

const buildRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null;
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
      console.warn(`⚠️   Redis unavailable (${err.message}). Using in-memory fallback.`);
    }
  });

  return client;
};

-- End uncomment block -- */

// ─── Exported client proxy ────────────────────────────────────────────────────
const realClient = null; // placeholder — replace with buildRedisClient() when ready
const fallback = new MemoryStore();

console.log('ℹ️   Redis disconnected — using in-memory store (development mode).');

// No-op until Redis is re-enabled
export const connectRedis = async () => {
  // TODO: uncomment when Redis is available:
  // try {
  //   await realClient.connect();
  // } catch {
  //   usingFallback = true;
  //   console.warn('⚠️   Redis not reachable. Running with in-memory token store.');
  // }
};

// The proxy always routes to the in-memory fallback for now.
// When Redis is re-enabled, change target to: usingFallback ? fallback : realClient
const redis = new Proxy(
  {},
  {
    get(_, method) {
      return (...args) => {
        const target = fallback; // ← always fallback until Redis is reconnected
        if (typeof target[method] === 'function') {
          return target[method](...args);
        }
        return target[method];
      };
    },
  }
);

// Cache TTLs (seconds)
export const TTL = {
  PRODUCT: 60 * 10,        // 10 min
  CATEGORY: 60 * 30,       // 30 min
  OTP: 60 * 10,            // 10 min
  RATE_LIMIT: 60 * 15,     // 15 min window
};

export const isRedisAvailable = () => !usingFallback;

export { realClient };
export default redis;
