/**
 * Axios instance for the Admin portal.
 * - Injects Bearer token from Redux store on every request
 * - Silently refreshes token on 401 with request queuing
 * - On refresh failure, logs the admin out
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// ─── Store accessor (injected from main.jsx) ──────────────────────────────────
let _store = null;
export const injectStore = (store) => { _store = store; };
const getStore = () => _store;

// ─── Instance ─────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request — attach token ───────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  try {
    const token = getStore()?.getState().auth.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// ─── Response — silent refresh on 401 ────────────────────────────────────────
let isRefreshing = false;
let queue = [];

const processQueue = (err, token = null) => {
  queue.forEach((p) => err ? p.reject(err) : p.resolve(token));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);
    if (['/auth/login', '/auth/refresh'].some((ep) => original.url?.includes(ep)))
      return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject }))
        .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
      const { accessToken } = data.data;

      const { setCredentials } = await import('../features/auth/authSlice.js');
      const store = getStore();
      store.dispatch(setCredentials({ user: store.getState().auth.user, accessToken }));

      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError);
      const { logoutAction } = await import('../features/auth/authSlice.js');
      getStore()?.dispatch(logoutAction());
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
