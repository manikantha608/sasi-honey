import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service.js';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authService.login({ email, password });
      const { user, accessToken } = res.data.data;
      if (user.role !== 'admin') {
        return rejectWithValue('Access denied. Admin account required.');
      }
      return { user, accessToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try { await authService.logout(); } catch {}
});

export const refreshThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const res  = await authService.refresh();
      const { accessToken } = res.data.data;

      // Verify the user is still admin
      const me = await authService.me();
      const user = me.data.data.user;
      if (user.role !== 'admin') return rejectWithValue('Not an admin');
      return { user, accessToken };
    } catch (err) {
      return rejectWithValue('Session expired');
    }
  },
  {
    condition: (_, { getState }) => {
      const { isInitialized, isRefreshPending } = getState().auth;
      return !isInitialized && !isRefreshPending;
    },
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:             null,
    accessToken:      null,
    isAuthenticated:  false,
    isInitialized:    false,
    isRefreshPending: false,
    isLoading:        false,
    error:            null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user            = action.payload.user;
      state.accessToken     = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isInitialized   = true;
      state.error           = null;
    },
    logoutAction: (state) => {
      state.user            = null;
      state.accessToken     = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginThunk.pending,    (s) => { s.isLoading = true;  s.error = null; })
      .addCase(loginThunk.fulfilled,  (s, a) => {
        s.isLoading        = false;
        s.user             = a.payload.user;
        s.accessToken      = a.payload.accessToken;
        s.isAuthenticated  = true;
        s.isInitialized    = true;
      })
      .addCase(loginThunk.rejected,   (s, a) => { s.isLoading = false; s.error = a.payload; });

    // Logout
    builder.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null; s.accessToken = null; s.isAuthenticated = false;
    });

    // Refresh
    builder
      .addCase(refreshThunk.pending,   (s) => { s.isRefreshPending = true; })
      .addCase(refreshThunk.fulfilled, (s, a) => {
        s.isRefreshPending = false;
        s.user             = a.payload.user;
        s.accessToken      = a.payload.accessToken;
        s.isAuthenticated  = true;
        s.isInitialized    = true;
      })
      .addCase(refreshThunk.rejected, (s) => {
        s.isRefreshPending = false;
        s.user             = null;
        s.accessToken      = null;
        s.isAuthenticated  = false;
        s.isInitialized    = true;
      });
  },
});

export const { setCredentials, logoutAction, clearError } = authSlice.actions;

export const selectCurrentUser    = (s) => s.auth.user;
export const selectIsAuthenticated= (s) => s.auth.isAuthenticated;
export const selectIsInitialized  = (s) => s.auth.isInitialized;
export const selectAuthLoading    = (s) => s.auth.isLoading;
export const selectAuthError      = (s) => s.auth.error;

export default authSlice.reducer;
