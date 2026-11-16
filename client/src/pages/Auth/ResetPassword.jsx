import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetPasswordThunk,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  clearError,
  clearSuccess,
} from '../../features/auth/authSlice.js';
import FormInput from '../../components/common/FormInput.jsx';
import Alert from '../../components/common/Alert.jsx';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectAuthSuccess);

  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
    return () => { dispatch(clearError()); dispatch(clearSuccess()); };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => navigate('/login', {
        state: { message: 'Password reset successful. Please log in with your new password.' }
      }), 2500);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'At least 8 characters required';
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) return;
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    dispatch(resetPasswordThunk({ token, password: form.password, confirmPassword: form.confirmPassword }));
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block" aria-hidden="true">⚠️</span>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Invalid reset link</h2>
          <p className="text-gray-500 mb-6">This password reset link is missing or invalid.</p>
          <Link to="/forgot-password" className="btn-primary">Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl" aria-hidden="true">🔒</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2">Set new password</h1>
          <p className="text-gray-500 mt-1">Choose a strong new password</p>
        </div>

        <div className="card p-8">
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}
          {successMessage && (
            <Alert variant="success" className="mb-5">
              {successMessage} Redirecting to login…
            </Alert>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <FormInput
                id="password" name="password" type="password" label="New password" required
                autoComplete="new-password" value={form.password} onChange={handleChange}
                placeholder="Min 8 characters" error={fieldErrors.password}
                hint="Min 8 chars, uppercase, lowercase, number, special char"
              />
              <FormInput
                id="confirmPassword" name="confirmPassword" type="password"
                label="Confirm new password" required
                autoComplete="new-password" value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter new password" error={fieldErrors.confirmPassword}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            <Link to="/login" className="text-honey-600 font-medium hover:underline">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
