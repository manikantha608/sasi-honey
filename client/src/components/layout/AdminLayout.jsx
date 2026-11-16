import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutThunk } from '../../features/auth/authSlice.js';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '🍯' },
  { to: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/customers', label: 'Customers', icon: '👤' },
  { to: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { to: '/admin/payments', label: 'Payments', icon: '💳' },
];

const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-honey-500 text-white'
        : 'text-gray-700 hover:bg-honey-50 hover:text-honey-700'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 flex flex-col
                         transition-all duration-200 shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {sidebarOpen && (
            <span className="font-display font-bold text-honey-600">Admin Panel</span>
          )}
          <button onClick={() => setSidebarOpen((o) => !o)} className="p-1 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle sidebar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <span aria-hidden="true">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm
                             font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
            <span aria-hidden="true">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
