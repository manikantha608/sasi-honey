import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Login       = lazy(() => import('../pages/Login/index.jsx'));
const Dashboard   = lazy(() => import('../pages/Dashboard/index.jsx'));
const Products    = lazy(() => import('../pages/Products/index.jsx'));
const ProductForm = lazy(() => import('../pages/Products/ProductForm.jsx'));
const Categories  = lazy(() => import('../pages/Categories/index.jsx'));
const ComingSoon  = lazy(() => import('../pages/ComingSoon.jsx'));

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoutes = () => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected — all inside AdminLayout */}
      <Route element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index                       element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"           element={<Dashboard />} />
        <Route path="/products"            element={<Products />} />
        <Route path="/products/new"        element={<ProductForm />} />
        <Route path="/products/:id/edit"   element={<ProductForm />} />
        <Route path="/categories"          element={<Categories />} />
        <Route path="/orders"              element={<ComingSoon title="Orders" />} />
        <Route path="/customers"           element={<ComingSoon title="Customers" />} />
        <Route path="/coupons"             element={<ComingSoon title="Coupons" />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default AdminRoutes;
