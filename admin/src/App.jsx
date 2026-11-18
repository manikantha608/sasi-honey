import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsInitialized } from './features/auth/authSlice.js';
import useAuthInit from './hooks/useAuthInit.js';
import AdminRoutes from './routes/index.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

const App = () => {
  const isInitialized = useAuthInit();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  );
};

export default App;
