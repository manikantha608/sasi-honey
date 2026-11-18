import React from 'react';

const ComingSoon = ({ title }) => (
  <div>
    <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">{title}</h1>
    <div className="card p-16 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon</h2>
      <p className="text-gray-400 text-sm">This section is under development.</p>
    </div>
  </div>
);

export default ComingSoon;
