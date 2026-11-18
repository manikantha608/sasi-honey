import React, { useEffect, useState } from 'react';
import { adminService, categoriesService } from '../../services/admin.service.js';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
       onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
      </div>
      {children}
    </div>
  </div>
);

const CategoryForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState({
    name:        initial?.name        || '',
    description: initial?.description || '',
    sortOrder:   initial?.sort_order  ?? 0,
    isActive:    initial?.is_active   ?? true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(initial?.image_url || null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, sortOrder: Number(form.sortOrder), imageFile }); }}
          className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input name="name" value={form.name} onChange={(e) => set('name', e.target.value)}
               required className="input-field" placeholder="e.g. Raw Honey" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                  rows={2} className="input-field resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <input type="number" min="0" value={form.sortOrder}
                 onChange={(e) => set('sortOrder', e.target.value)} className="input-field" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
                   onChange={(e) => set('isActive', e.target.checked)}
                   className="h-4 w-4 rounded text-honey-500" />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        {preview && <img src={preview} alt="preview" className="w-20 h-20 object-cover rounded-lg mb-2 border" />}
        <input type="file" accept="image/*" onChange={handleImage}
               className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg
                          file:border-0 file:bg-honey-50 file:text-honey-700 hover:file:bg-honey-100 cursor-pointer" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');

  const toast$ = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const load = () => {
    setLoading(true);
    adminService.getCategories()
      .then((r) => setCategories(r.data.data.categories))
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async ({ name, description, sortOrder, isActive, imageFile }) => {
    setSaving(true);
    try {
      const isEdit = modal.mode === 'edit';
      let saved;
      if (isEdit) {
        const r = await categoriesService.update(modal.category.id, { name, description, sortOrder, isActive });
        saved = r.data.data.category;
      } else {
        const r = await categoriesService.create({ name, description, sortOrder });
        saved = r.data.data.category;
      }
      if (imageFile) {
        const fd = new FormData(); fd.append('image', imageFile);
        await categoriesService.uploadImage(saved.id, fd);
      }
      setModal(null);
      toast$(isEdit ? 'Updated' : 'Created');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    try {
      await categoriesService.delete(cat.id);
      toast$('Deleted');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} total</p>
        </div>
        <button onClick={() => setModal({ mode: 'create' })} className="btn-primary text-sm">
          + Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between">
          {error} <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="card p-8 text-center text-gray-400">Loading…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Slug</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Products</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cat.image_url
                        ? <img src={cat.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                        : <div className="w-9 h-9 rounded-lg bg-honey-50 flex items-center justify-center text-lg">🏷️</div>
                      }
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
                    <span className={cat.is_active ? 'badge-green' : 'badge-gray'}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setModal({ mode: 'edit', category: cat })}
                              className="btn-ghost text-honey-600 hover:text-honey-700 hover:bg-honey-50">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat)}
                              className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50">
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

      {modal && (
        <Modal title={modal.mode === 'create' ? 'Add Category' : 'Edit Category'} onClose={() => setModal(null)}>
          <CategoryForm initial={modal.category} saving={saving}
                        onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default Categories;
