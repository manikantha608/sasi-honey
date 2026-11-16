import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
  selectEmailVerified,
  logoutThunk,
} from '../features/auth/authSlice.js';

/**
 * Convenience hook that surfaces auth state and common auth actions.
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const emailVerified = useSelector(selectEmailVerified);

  const handleLogout = () => dispatch(logoutThunk());

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    emailVerified,
    logout: handleLogout,
  };
};

export default useAuth;
