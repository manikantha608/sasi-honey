import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  forgotPasswordThunk,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  clearError,
  clearSuccess,
} from '../../features/auth/authSlice.js';
import FormInput from '../../components/common/FormInput.jsx';
import Alert from '../../components/common/Alert.jsx';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectAuthSuccess);

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    dispatch(clearError());
    return () => { dispatch(clearError()); dispatch(clearSuccess()); };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) { setFieldError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setFieldError('Enter a valid email'); return; }
    setFieldError('');
    dispatch(forgotPasswordThunk(email.trim().toLowerCase()));
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl" aria-hidden="true">🔑</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2">Forgot password?</h1>
          <p className="text-gray-500 mt-1">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <div className="card p-8">
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}
          {successMessage && (
            <Alert variant="success" className="mb-5">{successMessage}</Alert>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                placeholder="you@example.com"
                error={fieldError}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-honey-600 font-medium hover:underline">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
