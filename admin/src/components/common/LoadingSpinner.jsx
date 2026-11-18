import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-honey-200 border-t-honey-500`}
         role="status" aria-label="Loading" />
  );
  if (fullScreen)
    return <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">{spinner}</div>;
  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
