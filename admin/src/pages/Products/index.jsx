import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, productsService } from '../../services/admin.service.js';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');

  const toast$ = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const load = () => {
    setLoading(true);
    adminService.getProducts()
      .then((r) => { setProducts(r.data.data.products); setFiltered(r.data.data.products); })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category_name.toLowerCase().includes(q)
    ) : products);
  }, [search, products]);

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await productsService.delete(p.id); toast$('Deleted'); load(); }
    catch (err) { setError(err.response?.data?.message || 'Delete failed'); }
  };

  const handleToggle = async (p) => {
    try { await productsService.update(p.id, { isActive: !p.is_active }); toast$(p.is_active ? 'Deactivated' : 'Activated'); load(); }
    catch { setError('Update failed'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} of {products.length}</p>
        </div>
        <Link to="/products/new" className="btn-primary text-sm w-fit">+ New Product</Link>
      </div>

      <div className="mb-4">
        <input type="search" placeholder="Search by name or category…" value={search}
               onChange={(e) => setSearch(e.target.value)} className="input-field max-w-xs" />
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
          <p className="text-gray-500 mb-4">No products found</p>
          <Link to="/products/new" className="btn-primary text-sm">Add First Product</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Tags</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const stock = Number(p.total_stock);
                const price = Number(p.min_price);
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.primary_image
                          ? <img src={p.primary_image} alt={p.name}
                                 className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                          : <div className="w-10 h-10 rounded-lg bg-honey-50 flex items-center justify-center text-xl flex-shrink-0">🍯</div>
                        }
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.variant_count} variant{p.variant_count != 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category_name}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {price > 0 ? `₹${price.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${stock === 0 ? 'text-red-600' : stock <= 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {p.is_featured   && <span className="badge-honey">Featured</span>}
                        {p.is_bestseller && <span className="badge-green">Bestseller</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(p)}
                              className={p.is_active ? 'badge-green cursor-pointer hover:opacity-80' : 'badge-gray cursor-pointer hover:opacity-80'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/products/${p.id}/edit`}
                              className="btn-ghost text-honey-600 hover:text-honey-700 hover:bg-honey-50">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(p)}
                                className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50">
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
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default Products;
