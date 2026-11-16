import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍯</span>
            <span className="font-display text-xl font-bold text-white">Sasi Honey</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
            Pure, natural honey sourced directly from trusted beekeepers across India.
            No additives, no processing — just the goodness of nature.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-honey-400 transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-honey-400 transition-colors">Products</Link></li>
            <li><Link to="/cart" className="hover:text-honey-400 transition-colors">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-honey-400 transition-colors">My Orders</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📧 hello@sasihoney.com</li>
            <li>📞 +91 99999 99900</li>
            <li>📍 Kerala, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Sasi Honey. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
