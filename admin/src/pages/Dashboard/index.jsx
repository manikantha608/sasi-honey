import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service.js';

const StatCard = ({ label, value, icon, sub, to, color = 'honey' }) => {
  const cls = {
    honey:  'bg-honey-50  text-honey-600',
    green:  'bg-green-50  text-green-600',
    blue:   'bg-blue-50   text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red:    'bg-red-50    text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  const inner = (
    <div className="card p-5 flex items-start justify-between hover:shadow-md transition-shadow cursor-pointer">
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className={`${cls[color]} text-2xl p-2.5 rounded-xl`}>{icon}</span>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <div>{inner}</div>;
};

const Dashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    adminService.getStats()
      .then((r) => setStats(r.data.data.stats))
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your store at a glance</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard label="Products"   icon="🍯" color="honey"  to="/products"
          value={loading ? '…' : stats?.totalProducts}
          sub={stats ? `${stats.featuredProducts} featured` : null} />
        <StatCard label="Categories" icon="🏷️" color="blue"   to="/categories"
          value={loading ? '…' : stats?.totalCategories} />
        <StatCard label="Customers"  icon="👤" color="purple"
          value={loading ? '…' : stats?.totalCustomers} />
        <StatCard label="Orders"     icon="📦" color="green"
          value={loading ? '…' : stats?.totalOrders} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Low Stock" icon="⚠️" color="red"
          value={loading ? '…' : stats?.lowStockCount} sub="Variants need restocking" />
        <StatCard label="Bestsellers" icon="⭐" color="orange"
          value={loading ? '…' : stats?.bestsellers} />
        <StatCard label="Featured" icon="✨" color="honey"
          value={loading ? '…' : stats?.featuredProducts} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/products/new"  className="btn-primary text-sm">+ New Product</Link>
          <Link to="/categories"    className="btn-outline text-sm">Manage Categories</Link>
          <Link to="/products"      className="btn-outline text-sm">All Products</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
