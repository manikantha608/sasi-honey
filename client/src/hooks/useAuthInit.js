/**
 * useAuthInit
 *
 * Runs once on app start. Attempts a silent token refresh using the
 * HttpOnly refresh-token cookie. If the cookie is valid, the user
 * is restored to an authenticated state without needing to log in again.
 *
 * Sets isInitialized = true when done (success or failure).
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshThunk, selectIsInitialized } from '../features/auth/authSlice.js';

const useAuthInit = () => {
  const dispatch = useDispatch();
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    if (!isInitialized) {
      dispatch(refreshThunk());
    }
  }, [dispatch, isInitialized]);

  return isInitialized;
};

export default useAuthInit;
