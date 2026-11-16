import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginThunk,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  clearError,
} from '../../features/auth/authSlice.js';
import FormInput from '../../components/common/FormInput.jsx';
import Alert from '../../components/common/Alert.jsx';
import GoogleButton from '../../components/common/GoogleButton.jsx';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already logged in
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email';
    if (!form.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    dispatch(loginThunk({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      rememberMe: form.rememberMe,
    }));
  };

  // Show message from redirect (e.g., after register)
  const infoMessage = location.state?.message;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl" aria-hidden="true">🍯</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your Sasi Honey account</p>
        </div>

        <div className="card p-8">
          {infoMessage && <Alert variant="info" className="mb-5">{infoMessage}</Alert>}
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}

          {/* Google Sign In */}
          <GoogleButton label="Sign in with Google" disabled={isLoading} />

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={fieldErrors.email}
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={fieldErrors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-honey-500
                             focus:ring-honey-400 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me for 30 days</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-honey-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-honey-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
