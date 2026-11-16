/**
 * GoogleCallback.jsx
 *
 * The backend redirects here after a successful Google OAuth flow:
 *   /auth/callback?token=ACCESS_TOKEN&isNew=1
 *
 * This page:
 * 1. Reads the access token from the URL
 * 2. Calls /auth/me to get the full user object
 * 3. Stores credentials in Redux
 * 4. Cleans up the URL and redirects to home (or intended page)
 */
import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/auth/authSlice.js';
import { authService } from '../../services/auth.service.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const processed = useRef(false); // prevent double-fire in React StrictMode

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const isNew = searchParams.get('isNew') === '1';
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    // Temporarily store token and fetch user profile
    const fetchUser = async () => {
      try {
        // Set the token in api headers temporarily
        const res = await authService.me({
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.data.user;

        dispatch(setCredentials({ user, accessToken: token }));
        navigate('/', { replace: true });
      } catch {
        navigate('/login?error=session_error', { replace: true });
      }
    };

    fetchUser();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500">Completing sign in with Google…</p>
    </div>
  );
};

export default GoogleCallback;
