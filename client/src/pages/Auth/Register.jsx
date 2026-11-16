import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerThunk,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  clearError,
  clearSuccess,
} from '../../features/auth/authSlice.js';
import FormInput from '../../components/common/FormInput.jsx';
import Alert from '../../components/common/Alert.jsx';
import GoogleButton from '../../components/common/GoogleButton.jsx';

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectAuthSuccess);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    return () => { dispatch(clearError()); dispatch(clearSuccess()); };
  }, [dispatch]);

  // After successful registration, redirect to login
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => {
        navigate('/login', { state: { message: successMessage } });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }));
    if (name === 'password') setShowPasswordStrength(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!form.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email';

    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      errors.phone = 'Enter a valid 10-digit Indian mobile number';

    if (!form.password) {
      errors.password = 'Password is required';
    } else {
      const failed = PASSWORD_RULES.filter((r) => !r.test(form.password));
      if (failed.length) errors.password = failed[0].label + ' required';
    }

    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    dispatch(registerThunk({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone || undefined,
      password: form.password,
    }));
  };

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl" aria-hidden="true">🍯</span>
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2">Create account</h1>
          <p className="text-gray-500 mt-1">Join Sasi Honey today</p>
        </div>

        <div className="card p-8">
          {error && <Alert variant="error" className="mb-5">{error}</Alert>}
          {successMessage && (
            <Alert variant="success" className="mb-5">
              {successMessage} Redirecting to login…
            </Alert>
          )}

          {/* Google Sign Up */}
          <GoogleButton label="Sign up with Google" disabled={isLoading || !!successMessage} />

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormInput
              id="name" name="name" type="text" label="Full name" required
              autoComplete="name" value={form.name} onChange={handleChange}
              placeholder="Your full name" error={fieldErrors.name}
            />
            <FormInput
              id="email" name="email" type="email" label="Email address" required
              autoComplete="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" error={fieldErrors.email}
            />
            <FormInput
              id="phone" name="phone" type="tel" label="Phone number"
              autoComplete="tel" value={form.phone} onChange={handleChange}
              placeholder="98765 43210" error={fieldErrors.phone}
              hint="10-digit Indian mobile number"
            />

            <div>
              <FormInput
                id="password" name="password" type="password" label="Password" required
                autoComplete="new-password" value={form.password} onChange={handleChange}
                placeholder="Min 8 characters" error={fieldErrors.password}
              />
              {/* Password strength indicator */}
              {showPasswordStrength && form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= passwordStrength
                            ? passwordStrength <= 2 ? 'bg-red-400'
                              : passwordStrength <= 3 ? 'bg-yellow-400'
                              : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {PASSWORD_RULES.map((rule) => (
                      <span
                        key={rule.label}
                        className={`text-xs flex items-center gap-1 ${
                          rule.test(form.password) ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {rule.test(form.password) ? '✓' : '·'} {rule.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <FormInput
              id="confirmPassword" name="confirmPassword" type="password"
              label="Confirm password" required
              autoComplete="new-password" value={form.confirmPassword} onChange={handleChange}
              placeholder="Re-enter password" error={fieldErrors.confirmPassword}
            />

            <button
              type="submit"
              disabled={isLoading || !!successMessage}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-honey-600 font-medium hover:underline">Sign in</Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
