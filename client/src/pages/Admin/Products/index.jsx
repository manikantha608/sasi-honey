import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../../services/admin.service.js';
import { productsService } from '../../../services/products.service.js';

const Badge = ({ children, color = 'gray' }) => {
  const cls = {
    green:  'bg-green-100 text-green-700',
    gray:   'bg-gray-100  text-gray-500',
    honey:  'bg-honey-100 text-honey-700',
    orange: 'bg-orange-100 text-orange-700',
    red:    'bg-red-100   text-red-600',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls[color]}`}>{children}</span>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = () => {
    setLoading(true);
    adminService.getProducts()
      .then((r) => {
        setProducts(r.data.data.products);
        setFiltered(r.data.data.products);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Client-side search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category_name.toLowerCase().includes(q))
        : products
    );
  }, [search, products]);

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This will hide it from the store.`)) return;
    try {
      await productsService.delete(product.id);
      showToast('Product deleted');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productsService.update(product.id, { isActive: !product.is_active });
      showToast(product.is_active ? 'Product deactivated' : 'Product activated');
      load();
    } catch {
      setError('Update failed');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {products.length} products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-sm w-fit">+ Add Product</Link>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="search"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-sm max-w-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between">
          {error} <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🍯</div>
          <p className="text-gray-500">No products found.</p>
          <Link to="/admin/products/new" className="btn-primary text-sm mt-4 inline-block">Add First Product</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Tags</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const stock = Number(p.total_stock);
                const price = Number(p.min_price);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.primary_image ? (
                          <img src={p.primary_image} alt={p.name}
                               className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-honey-50 flex items-center justify-center text-xl flex-shrink-0">🍯</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.variant_count} variant{p.variant_count != 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-600">{p.category_name}</td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {price > 0 ? `₹${price.toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${stock === 0 ? 'text-red-600' : stock <= 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {stock}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {p.is_featured   && <Badge color="honey">Featured</Badge>}
                        {p.is_bestseller && <Badge color="green">Bestseller</Badge>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(p)}
                              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                                p.is_active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${p.id}/edit`}
                              className="text-xs text-honey-600 hover:text-honey-700 font-medium px-2 py-1 rounded hover:bg-honey-50">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(p)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
