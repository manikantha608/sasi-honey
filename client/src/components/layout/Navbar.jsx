import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from '../../features/auth/authSlice.js';
import { logoutThunk } from '../../features/auth/authSlice.js';
import { selectCartCount } from '../../features/cart/cartSlice.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const cartCount = useSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-honey-600' : 'text-gray-700 hover:text-honey-600'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍯</span>
            <span className="font-display text-xl font-bold text-honey-600">Sasi Honey</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-honey-600" aria-label="Cart">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11M9 19a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-honey-500 text-white text-xs font-bold
                                 h-5 w-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-600">Hi, {user?.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="btn-outline text-sm py-1.5 px-4">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline text-sm py-1.5 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-3">
            <NavLink to="/" className={navLinkClass} end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/products" className={navLinkClass} onClick={() => setMenuOpen(false)}>Products</NavLink>
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="text-left text-sm text-gray-700 hover:text-honey-600">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:text-honey-600"
                      onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-sm w-fit"
                      onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
