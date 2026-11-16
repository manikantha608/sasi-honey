/**
 * Axios instance with:
 * - Automatic Authorization header injection from Redux store
 * - Silent token refresh on 401 (token rotation)
 * - Request queuing during refresh
 *
 * IMPORTANT — circular dependency fix:
 * We do NOT import `store` at the top level because:
 *   store → authSlice → auth.service → api → store  (circular)
 *
 * Instead we use a `getStore()` accessor that is injected AFTER the store
 * is created. This breaks the cycle while keeping full functionality.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// ─── Store accessor (injected from main.jsx after store is created) ───────────
let _store = null;

export const injectStore = (store) => {
  _store = store;
};

const getStore = () => {
  if (!_store) throw new Error('Redux store not injected into api.js yet');
  return _store;
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    try {
      const token = getStore().getState().auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Store not yet injected (early requests) — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — silent token refresh on 401 ──────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only intercept 401s; avoid infinite loops with the _retry flag
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Never retry auth endpoints themselves
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (authEndpoints.some((ep) => original.url?.includes(ep))) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the failed request to retry once refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch((err) => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // Use a plain axios call (no interceptors) so we don't loop
      const { data } = await axios.post(
        `${API_BASE}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const { accessToken } = data.data;

      // Lazy import to avoid the circular dep at module-load time
      const { setCredentials } = await import('../features/auth/authSlice.js');
      const store = getStore();
      const user = store.getState().auth.user;
      store.dispatch(setCredentials({ user, accessToken }));

      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Lazy import — same reason as above
      const { logoutThunk } = await import('../features/auth/authSlice.js');
      try { getStore().dispatch(logoutThunk()); } catch { /* store gone */ }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
