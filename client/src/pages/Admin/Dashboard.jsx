import React from 'react';

const stats = [
  { label: 'Total Revenue', value: '—', icon: '💰' },
  { label: 'Total Orders', value: '—', icon: '📦' },
  { label: 'Total Customers', value: '—', icon: '👤' },
  { label: 'Total Products', value: '—', icon: '🍯' },
];

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="font-display text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="card p-6">
          <div className="text-3xl mb-3">{s.icon}</div>
          <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          <div className="text-sm text-gray-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="card p-8 text-center">
      <p className="text-gray-500">Full dashboard analytics will be implemented in Phase 6.</p>
    </div>
  </div>
);

export default AdminDashboard;
