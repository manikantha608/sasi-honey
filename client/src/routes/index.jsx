import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice.js';
import MainLayout from '../components/layout/MainLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const Home            = lazy(() => import('../pages/Home/index.jsx'));
const Products        = lazy(() => import('../pages/Products/index.jsx'));
const ProductDetails  = lazy(() => import('../pages/ProductDetails/index.jsx'));
const Cart            = lazy(() => import('../pages/Cart/index.jsx'));
const Checkout        = lazy(() => import('../pages/Checkout/index.jsx'));
const Orders          = lazy(() => import('../pages/Orders/index.jsx'));
const NotFound        = lazy(() => import('../pages/NotFound.jsx'));

// Auth pages
const Login              = lazy(() => import('../pages/Auth/Login.jsx'));
const Register           = lazy(() => import('../pages/Auth/Register.jsx'));
const ForgotPassword     = lazy(() => import('../pages/Auth/ForgotPassword.jsx'));
const ResetPassword      = lazy(() => import('../pages/Auth/ResetPassword.jsx'));
const VerifyEmail        = lazy(() => import('../pages/Auth/VerifyEmail.jsx'));
const GoogleCallback     = lazy(() => import('../pages/Auth/GoogleCallback.jsx'));

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Requires authentication. */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : (
    <Navigate to="/login" replace state={{ from: window.location, message: 'Please log in to continue.' }} />
  );
};

/** Redirects authenticated users away from guest-only pages. */
const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ─── Route Tree ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Routes>
      {/* ── Public routes — shared customer layout ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />

        {/* ── Guest-only auth routes ── */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

        {/* ── Open auth routes (no guard needed) ── */}
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ── Google OAuth callback — no layout needed but grouped here ── */}
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* ── Protected customer routes ── */}
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
