import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <span className="text-7xl mb-6">🍯</span>
    <h1 className="font-display text-5xl font-bold text-gray-900 mb-3">404</h1>
    <p className="text-xl text-gray-600 mb-2">Page not found</p>
    <p className="text-gray-400 mb-8 max-w-md">
      Looks like this page dripped away. Let&apos;s get you back to the good stuff.
    </p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
