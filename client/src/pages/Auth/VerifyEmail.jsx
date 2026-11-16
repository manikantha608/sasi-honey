import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  verifyEmailThunk,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
  clearError,
  clearSuccess,
} from '../../features/auth/authSlice.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import Alert from '../../components/common/Alert.jsx';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const successMessage = useSelector(selectAuthSuccess);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    if (token && !attempted) {
      setAttempted(true);
      dispatch(verifyEmailThunk(token));
    }
    return () => { dispatch(clearError()); dispatch(clearSuccess()); };
  }, [dispatch, token, attempted]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {isLoading && (
          <>
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Verifying your email…</p>
          </>
        )}

        {!isLoading && successMessage && (
          <div className="card p-10">
            <div className="text-6xl mb-5" aria-hidden="true">✅</div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">{successMessage}</p>
            <Link to="/login" className="btn-primary">Log in now</Link>
          </div>
        )}

        {!isLoading && error && (
          <div className="card p-10">
            <div className="text-6xl mb-5" aria-hidden="true">❌</div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Verification failed</h1>
            <Alert variant="error" className="mb-6">{error}</Alert>
            <p className="text-gray-500 mb-4 text-sm">
              The link may have expired or already been used.
            </p>
            <Link to="/resend-verification" className="btn-primary">
              Request a new link
            </Link>
          </div>
        )}

        {!token && !isLoading && (
          <div className="card p-10">
            <div className="text-6xl mb-5" aria-hidden="true">⚠️</div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Invalid link</h1>
            <p className="text-gray-500 mb-6">No verification token found.</p>
            <Link to="/register" className="btn-primary">Back to register</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
