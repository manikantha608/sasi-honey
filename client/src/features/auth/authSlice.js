import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service.js';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.register(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      return res.data.data; // { user, accessToken }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch {
      // Logout should clear local state even if server call fails
    }
  }
);

export const refreshThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.refresh();
      return res.data.data; // { accessToken }
    } catch (err) {
      return rejectWithValue('Session expired');
    }
  },
  {
    // Skip dispatch if a refresh is already in progress or the session is
    // already initialized — prevents React StrictMode double-fire and
    // other concurrent callers from sending two requests with the same cookie.
    condition: (_, { getState }) => {
      const { isInitialized, isRefreshPending } = getState().auth;
      return !isInitialized && !isRefreshPending;
    },
  }
);

export const getMeThunk = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authService.me();
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const res = await authService.forgotPassword(email);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Request failed');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await authService.resetPassword(token, password, confirmPassword);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Reset failed');
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const res = await authService.changePassword(currentPassword, newPassword, confirmPassword);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Change failed');
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const res = await authService.verifyEmail(token);
      return res.data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Verification failed');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false, // has the app attempted to restore session?
  isRefreshPending: false, // a silent refresh is currently in-flight
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called when Google OAuth callback returns a token
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // ── Register ──
    builder
      .addCase(registerThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Registration successful! Please verify your email.';
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Login ──
    builder
      .addCase(loginThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Logout ──
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.successMessage = null;
      });

    // ── Refresh ──
    builder
      .addCase(refreshThunk.pending, (state) => {
        state.isRefreshPending = true;
      })
      .addCase(refreshThunk.fulfilled, (state, action) => {
        state.isRefreshPending = false;
        state.accessToken = action.payload.accessToken;
        state.isInitialized = true;
      })
      .addCase(refreshThunk.rejected, (state) => {
        state.isRefreshPending = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });

    // ── Get Me ──
    builder
      .addCase(getMeThunk.pending, (state) => { state.isLoading = true; })
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(getMeThunk.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      });

    // ── Forgot / Reset / Change Password ──
    builder
      .addCase(forgotPasswordThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(forgotPasswordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(resetPasswordThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    builder
      .addCase(changePasswordThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(changePasswordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Verify Email ──
    builder
      .addCase(verifyEmailThunk.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(verifyEmailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
        if (state.user) state.user.emailVerified = true;
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, clearError, clearSuccess, setInitialized, updateUser } = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.successMessage;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectEmailVerified = (state) => state.auth.user?.emailVerified ?? false;

export default authSlice.reducer;
