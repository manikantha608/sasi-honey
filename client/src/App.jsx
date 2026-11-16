import React from 'react';
import useAuthInit from './hooks/useAuthInit.js';
import AppRoutes from './routes/index.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

function App() {
  const isInitialized = useAuthInit();

  // Block render until we know if the user has an active session.
  // This prevents a flash where protected pages show briefly before redirect.
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <span className="text-4xl" aria-hidden="true">🍯</span>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
