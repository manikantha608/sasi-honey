import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service.js';

const StatCard = ({ label, value, icon, sub, to, color = 'honey' }) => {
  const colorMap = {
    honey:  'bg-honey-50  text-honey-600',
    green:  'bg-green-50  text-green-600',
    blue:   'bg-blue-50   text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red:    'bg-red-50    text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  const content = (
    <div className="card p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <span className={`${colorMap[color]} text-2xl p-3 rounded-xl`}>{icon}</span>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : <div>{content}</div>;
};

const AdminDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    adminService.getStats()
      .then((res) => setStats(res.data.data.stats))
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Overview of your store</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Total Products"   icon="🍯" color="honey"  to="/admin/products"
          value={loading ? '…' : stats?.totalProducts}
          sub={stats ? `${stats.featuredProducts} featured` : null} />
        <StatCard label="Categories"       icon="🏷️" color="blue"   to="/admin/categories"
          value={loading ? '…' : stats?.totalCategories} />
        <StatCard label="Customers"        icon="👤" color="purple"
          value={loading ? '…' : stats?.totalCustomers} />
        <StatCard label="Total Orders"     icon="📦" color="green"
          value={loading ? '…' : stats?.totalOrders} />
      </div>

      {/* Secondary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard label="Low Stock Variants" icon="⚠️" color="red"
          value={loading ? '…' : stats?.lowStockCount}
          sub="Need restocking" />
        <StatCard label="Bestsellers"        icon="⭐" color="orange"
          value={loading ? '…' : stats?.bestsellers} />
        <StatCard label="Featured Products"  icon="✨" color="honey"
          value={loading ? '…' : stats?.featuredProducts} />
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/products/new" className="btn-primary text-sm">+ Add Product</Link>
          <Link to="/admin/categories"   className="btn-outline text-sm">Manage Categories</Link>
          <Link to="/admin/products"     className="btn-outline text-sm">View All Products</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
