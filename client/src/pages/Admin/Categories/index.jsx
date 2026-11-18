import React, { useEffect, useState, useRef } from 'react';
import { adminService } from '../../../services/admin.service.js';
import { categoriesService } from '../../../services/products.service.js';

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
       onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>
      {children}
    </div>
  </div>
);

// ─── Category Form ────────────────────────────────────────────────────────────
const CategoryForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState({
    name:        initial?.name        || '',
    description: initial?.description || '',
    sortOrder:   initial?.sort_order  ?? 0,
    isActive:    initial?.is_active   ?? true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(initial?.image_url || null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, sortOrder: Number(form.sortOrder), imageFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required
               className="input-field text-sm" placeholder="e.g. Raw Honey" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="input-field text-sm resize-none" placeholder="Short description…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input name="sortOrder" type="number" min="0" value={form.sortOrder} onChange={handleChange}
                 className="input-field text-sm" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                   className="h-4 w-4 rounded text-honey-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        {preview && (
          <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-lg mb-2 border" />
        )}
        <input type="file" accept="image/*" onChange={handleImage}
               className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                          file:border-0 file:text-sm file:font-medium file:bg-honey-50
                          file:text-honey-700 hover:file:bg-honey-100 cursor-pointer" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline text-sm py-2">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm py-2">
          {saving ? 'Saving…' : 'Save Category'}
        </button>
      </div>
    </form>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | { mode: 'create' | 'edit', category? }
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = () => {
    setLoading(true);
    adminService.getCategories()
      .then((r) => setCategories(r.data.data.categories))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async ({ name, description, sortOrder, isActive, imageFile }) => {
    setSaving(true);
    try {
      const isEdit = modal.mode === 'edit';
      let saved;

      if (isEdit) {
        const res = await categoriesService.update(modal.category.id, { name, description, sortOrder, isActive });
        saved = res.data.data.category;
      } else {
        const res = await categoriesService.create({ name, description, sortOrder });
        saved = res.data.data.category;
      }

      // Upload image if selected
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        await categoriesService.uploadImage(saved.id, fd);
      }

      setModal(null);
      showToast(isEdit ? 'Category updated' : 'Category created');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await categoriesService.delete(cat.id);
      showToast('Category deleted');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await categoriesService.update(cat.id, { isActive: !cat.is_active });
      showToast(cat.is_active ? 'Category deactivated' : 'Category activated');
      load();
    } catch {
      setError('Update failed');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} total</p>
        </div>
        <button onClick={() => setModal({ mode: 'create' })} className="btn-primary text-sm">
          + Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between">
          {error}
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card p-8 text-center text-gray-400">Loading…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Slug</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Products</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name}
                             className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center text-lg">🏷️</div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{cat.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{cat.product_count}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleActive(cat)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                              cat.is_active
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal({ mode: 'edit', category: cat })}
                              className="text-xs text-honey-600 hover:text-honey-700 font-medium px-2 py-1 rounded hover:bg-honey-50">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat)}
                              className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Add Category' : 'Edit Category'}
          onClose={() => setModal(null)}
        >
          <CategoryForm
            initial={modal.category}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
