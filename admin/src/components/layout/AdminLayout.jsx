import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk, selectCurrentUser } from '../../features/auth/authSlice.js';

const NAV = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '📊', end: true },
  { to: '/products',   label: 'Products',   icon: '🍯' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/orders',     label: 'Orders',     icon: '📦' },
  { to: '/customers',  label: 'Customers',  icon: '👤' },
  { to: '/coupons',    label: 'Coupons',    icon: '🎟️' },
];

const AdminLayout = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectCurrentUser);
  const [open, setOpen] = useState(true);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-honey-500 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sidebar ── */}
      <aside className={`${open ? 'w-56' : 'w-14'} flex-shrink-0 bg-white border-r border-gray-200
                         flex flex-col transition-all duration-200`}>

        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-100">
          {open && (
            <span className="font-display font-bold text-honey-600 text-lg leading-none">
              🍯 Admin
            </span>
          )}
          <button onClick={() => setOpen((o) => !o)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  aria-label="Toggle sidebar">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={open ? 'M11 19l-7-7 7-7M18 19l-7-7 7-7' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {open && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-2 border-t border-gray-100 space-y-0.5">
          {open && user && (
            <div className="px-3 py-2">
              <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm
                             font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <span className="text-base flex-shrink-0">🚪</span>
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <div className="flex-1" />
          <span className="text-sm text-gray-500">
            Logged in as <span className="font-medium text-gray-900">{user?.name}</span>
          </span>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
