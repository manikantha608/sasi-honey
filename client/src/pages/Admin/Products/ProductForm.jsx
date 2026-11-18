import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsService, categoriesService } from '../../../services/products.service.js';

// ─── Reusable field wrapper ───────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

// ─── Variant Row ──────────────────────────────────────────────────────────────
const emptyVariant = () => ({ label: '', weightGrams: '', price: '', mrp: '', sku: '', stockQty: 0, lowStockThreshold: 5, sortOrder: 0, _new: true });

const VariantRow = ({ v, idx, onChange, onDelete, onSave, onCancel, saving }) => {
  const [editing, setEditing] = useState(!!v._new);
  const [form, setForm]       = useState({ ...v });

  const set = (k, val) => setForm((f) => ({ ...f, [k]: val }));

  if (!editing) {
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-2 text-sm text-gray-900">{v.label}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{v.weight_grams || v.weightGrams}g</td>
        <td className="px-3 py-2 text-sm font-medium">₹{Number(v.price).toLocaleString('en-IN')}</td>
        <td className="px-3 py-2 text-sm text-gray-500">₹{Number(v.mrp).toLocaleString('en-IN')}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{v.sku}</td>
        <td className="px-3 py-2 text-sm font-medium">{v.stock_qty ?? v.stockQty}</td>
        <td className="px-3 py-2">
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)}
                    className="text-xs text-honey-600 hover:text-honey-700 font-medium">Edit</button>
            <button onClick={() => onDelete(v)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium">×</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-honey-50">
      {['label','weightGrams','price','mrp','sku','stockQty'].map((k) => (
        <td key={k} className="px-2 py-2">
          <input
            type={['weightGrams','price','mrp','stockQty'].includes(k) ? 'number' : 'text'}
            value={form[k]}
            onChange={(e) => set(k, e.target.value)}
            placeholder={k}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-honey-400"
          />
        </td>
      ))}
      <td className="px-2 py-2">
        <div className="flex gap-1">
          <button onClick={() => { onSave(v._new ? null : v.id, form); setEditing(false); }}
                  disabled={saving}
                  className="text-xs bg-honey-500 text-white px-2 py-1 rounded font-medium disabled:opacity-50">
            {saving ? '…' : '✓'}
          </button>
          <button onClick={() => { if (v._new) onCancel(idx); else setEditing(false); }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-1">✕</button>
        </div>
      </td>
    </tr>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const ProductForm = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const isEdit       = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(isEdit);
  const [saving,     setSaving]     = useState(false);
  const [varSaving,  setVarSaving]  = useState(false);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');
  const [tab,        setTab]        = useState('info');  // info | variants | images

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const [form, setForm] = useState({
    categoryId: '', name: '', slug: '', shortDesc: '', description: '',
    isFeatured: false, isBestseller: false, isActive: true,
    metaTitle: '', metaDesc: '',
  });

  const [variants,     setVariants]     = useState([]);
  const [images,       setImages]       = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  // Load categories
  useEffect(() => {
    categoriesService.getAll().then((r) => setCategories(r.data.data.categories));
  }, []);

  // Load product if editing
  useEffect(() => {
    if (!isEdit) return;
    productsService.getBySlug(id).then((r) => {
      // try by id if slug fails
    }).catch(() => {});

    // Use admin product endpoint (we'll fetch via slug from the product list)
    // Actually we need to fetch by id — let's get it via the slug endpoint using the product id
    // Since our API uses slug for GET, we'll handle this differently
    // We stored the id in the route — but the GET endpoint uses slug
    // Let me fetch from admin products list and find the one with matching id
    adminFetchProduct(id);
  }, [id, isEdit]);

  const adminFetchProduct = async (productId) => {
    try {
      // Get all admin products and find by id (simple approach while admin detail endpoint not built)
      const { default: adminSvc } = await import('../../../services/admin.service.js');
      const r = await adminSvc.getProducts();
      const found = r.data.data.products.find((p) => p.id === productId);
      if (!found) { setError('Product not found'); return; }

      // Get full product with variants and images by slug
      const full = await productsService.getBySlug(found.slug);
      const p = full.data.data.product;
      setProduct(p);
      setForm({
        categoryId:   p.category_id   || '',
        name:         p.name          || '',
        slug:         p.slug          || '',
        shortDesc:    p.short_desc    || '',
        description:  p.description   || '',
        isFeatured:   p.is_featured   || false,
        isBestseller: p.is_bestseller || false,
        isActive:     p.is_active     ?? true,
        metaTitle:    p.meta_title    || '',
        metaDesc:     p.meta_desc     || '',
      });
      setVariants(p.variants || []);
      setImages(p.images     || []);
    } catch (e) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Auto-generate slug from name on create
  useEffect(() => {
    if (!isEdit && form.name && !form.slug) {
      setF('slug', form.name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  }, [form.name]);

  const handleSaveBasic = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await productsService.update(id, form);
        showToast('Product updated');
        adminFetchProduct(id);
      } else {
        const r = await productsService.create(form);
        const newId = r.data.data.product.id;
        showToast('Product created — now add variants and images');
        navigate(`/admin/products/${newId}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Variants ──────────────────────────────────────────────────────────────
  const addVariantRow = () => setVariants((v) => [...v, emptyVariant()]);
  const cancelNewVariant = (idx) => setVariants((v) => v.filter((_, i) => i !== idx));

  const saveVariant = async (existingId, varForm) => {
    if (!isEdit) return showToast('Save the product first');
    setVarSaving(true);
    try {
      const payload = {
        label:              varForm.label,
        weightGrams:        Number(varForm.weightGrams),
        price:              Number(varForm.price),
        mrp:                Number(varForm.mrp),
        sku:                varForm.sku,
        stockQty:           Number(varForm.stockQty),
        lowStockThreshold:  Number(varForm.lowStockThreshold || 5),
        sortOrder:          Number(varForm.sortOrder || 0),
      };
      if (existingId) {
        await productsService.updateVariant(id, existingId, payload);
        showToast('Variant updated');
      } else {
        await productsService.addVariant(id, payload);
        showToast('Variant added');
      }
      adminFetchProduct(id);
    } catch (err) {
      setError(err.response?.data?.message || 'Variant save failed');
    } finally {
      setVarSaving(false);
    }
  };

  const deleteVariant = async (v) => {
    if (!confirm(`Delete variant "${v.label}"?`)) return;
    if (!v.id) { setVariants((vs) => vs.filter((x) => x !== v)); return; }
    try {
      await productsService.deleteVariant(id, v.id);
      showToast('Variant deleted');
      adminFetchProduct(id);
    } catch (err) { setError('Delete failed'); }
  };

  // ── Images ────────────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    if (!isEdit) return showToast('Save the product first');
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('isPrimary', images.length === 0 ? 'true' : 'false');
    try {
      await productsService.uploadImage(id, fd);
      showToast('Image uploaded');
      adminFetchProduct(id);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (image) => {
    if (!confirm('Delete this image?')) return;
    try {
      await productsService.deleteImage(id, image.id);
      showToast('Image deleted');
      adminFetchProduct(id);
    } catch { setError('Delete failed'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          {isEdit && <p className="text-gray-400 text-xs mt-0.5">{id}</p>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between">
          {error} <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: 'info',     label: 'Basic Info' },
          { key: 'variants', label: `Variants (${variants.length})` },
          { key: 'images',   label: `Images (${images.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === t.key
                      ? 'border-honey-500 text-honey-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Basic Info Tab ── */}
      {tab === 'info' && (
        <form onSubmit={handleSaveBasic} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Category" required>
              <select value={form.categoryId} onChange={(e) => setF('categoryId', e.target.value)} required
                      className="input-field text-sm">
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Product Name" required>
              <input value={form.name} onChange={(e) => setF('name', e.target.value)} required
                     className="input-field text-sm" placeholder="e.g. Pure Wild Forest Honey" />
            </Field>
          </div>

          <Field label="Slug" hint="Auto-generated from name. Use only lowercase letters, numbers and hyphens.">
            <input value={form.slug} onChange={(e) => setF('slug', e.target.value)}
                   className="input-field text-sm font-mono" placeholder="pure-wild-forest-honey" />
          </Field>

          <Field label="Short Description" hint="Shown in product cards (max 300 chars)">
            <input value={form.shortDesc} onChange={(e) => setF('shortDesc', e.target.value)}
                   className="input-field text-sm" maxLength={300} placeholder="One-line description…" />
          </Field>

          <Field label="Full Description">
            <textarea value={form.description} onChange={(e) => setF('description', e.target.value)}
                      rows={5} className="input-field text-sm resize-y"
                      placeholder="Detailed product description…" />
          </Field>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            {[
              { key: 'isFeatured',   label: 'Featured on homepage' },
              { key: 'isBestseller', label: 'Bestseller' },
              { key: 'isActive',     label: 'Active (visible in store)' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]}
                       onChange={(e) => setF(key, e.target.checked)}
                       className="h-4 w-4 rounded text-honey-500" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* SEO (collapsible) */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer select-none">
              SEO (optional)
            </summary>
            <div className="px-4 pb-4 space-y-3 pt-2">
              <Field label="Meta Title">
                <input value={form.metaTitle} onChange={(e) => setF('metaTitle', e.target.value)}
                       className="input-field text-sm" maxLength={200} />
              </Field>
              <Field label="Meta Description">
                <textarea value={form.metaDesc} onChange={(e) => setF('metaDesc', e.target.value)}
                          rows={2} className="input-field text-sm resize-none" maxLength={500} />
              </Field>
            </div>
          </details>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <Link to="/admin/products" className="btn-outline">Cancel</Link>
          </div>
        </form>
      )}

      {/* ── Variants Tab ── */}
      {tab === 'variants' && (
        <div>
          {!isEdit && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
              Save the product first, then you can add variants.
            </div>
          )}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Label', 'Weight (g)', 'Price ₹', 'MRP ₹', 'SKU', 'Stock', ''].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {variants.map((v, i) => (
                  <VariantRow key={v.id || i} v={v} idx={i}
                              onSave={saveVariant}
                              onDelete={deleteVariant}
                              onCancel={cancelNewVariant}
                              saving={varSaving} />
                ))}
              </tbody>
            </table>
          </div>

          {isEdit && (
            <button onClick={addVariantRow}
                    className="mt-4 text-sm text-honey-600 hover:text-honey-700 font-medium flex items-center gap-1">
              + Add Variant
            </button>
          )}
        </div>
      )}

      {/* ── Images Tab ── */}
      {tab === 'images' && (
        <div>
          {!isEdit && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
              Save the product first, then you can upload images.
            </div>
          )}
          {isEdit && (
            <div className="mb-5">
              <label className="cursor-pointer inline-flex items-center gap-2 btn-outline text-sm">
                <span>{imageUploading ? 'Uploading…' : '+ Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden"
                       disabled={imageUploading} />
              </label>
              <p className="text-xs text-gray-400 mt-1">Max 5MB. First image auto-set as primary.</p>
            </div>
          )}

          {images.length === 0 ? (
            <p className="text-gray-400 text-sm">No images yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-100">
                  <img src={img.image_url} alt={img.alt_text || ''}
                       className="w-full aspect-square object-cover" />
                  {img.is_primary && (
                    <span className="absolute top-2 left-2 bg-honey-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <button onClick={() => handleDeleteImage(img)}
                          className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6
                                     flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

export default ProductForm;
