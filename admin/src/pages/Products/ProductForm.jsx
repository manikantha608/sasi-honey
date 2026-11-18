import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService, productsService, categoriesService } from '../../services/admin.service.js';

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const emptyVariant = () => ({
  _new: true, label: '', weightGrams: '', price: '', mrp: '',
  sku: '', stockQty: 0, lowStockThreshold: 5, sortOrder: 0,
});

const VariantRow = ({ v, idx, onSave, onDelete, onCancelNew, varSaving }) => {
  const [editing, setEditing] = useState(!!v._new);
  const [form, setForm]       = useState({ ...v });
  const set = (k, val) => setForm((f) => ({ ...f, [k]: val }));

  if (!editing) {
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-3 py-2 text-sm font-medium">{v.label}</td>
        <td className="px-3 py-2 text-sm text-gray-600">{v.weight_grams || v.weightGrams}g</td>
        <td className="px-3 py-2 text-sm font-medium text-gray-900">₹{Number(v.price).toLocaleString('en-IN')}</td>
        <td className="px-3 py-2 text-sm text-gray-400 line-through">₹{Number(v.mrp).toLocaleString('en-IN')}</td>
        <td className="px-3 py-2 text-sm text-gray-500 font-mono">{v.sku}</td>
        <td className="px-3 py-2 text-sm font-medium">{v.stock_qty ?? v.stockQty}</td>
        <td className="px-3 py-2">
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs text-honey-600 hover:text-honey-700 font-medium">Edit</button>
            <button onClick={() => onDelete(v)} className="text-xs text-red-500 hover:text-red-600 font-medium">×</button>
          </div>
        </td>
      </tr>
    );
  }

  const fields = [
    { k: 'label',       type: 'text',   ph: '250g' },
    { k: 'weightGrams', type: 'number', ph: '250'  },
    { k: 'price',       type: 'number', ph: '299'  },
    { k: 'mrp',         type: 'number', ph: '349'  },
    { k: 'sku',         type: 'text',   ph: 'SKU-001' },
    { k: 'stockQty',    type: 'number', ph: '100'  },
  ];

  return (
    <tr className="bg-honey-50">
      {fields.map(({ k, type, ph }) => (
        <td key={k} className="px-2 py-2">
          <input type={type} value={form[k]} placeholder={ph}
                 onChange={(e) => set(k, e.target.value)}
                 className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-honey-400" />
        </td>
      ))}
      <td className="px-2 py-2">
        <div className="flex gap-1">
          <button onClick={() => { onSave(v._new ? null : v.id, form); setEditing(false); }}
                  disabled={varSaving}
                  className="text-xs bg-honey-500 text-white px-2.5 py-1.5 rounded font-medium disabled:opacity-50">
            {varSaving ? '…' : '✓'}
          </button>
          <button onClick={() => v._new ? onCancelNew(idx) : setEditing(false)}
                  className="text-xs text-gray-500 px-1.5 py-1.5 rounded hover:bg-gray-100">✕</button>
        </div>
      </td>
    </tr>
  );
};

const ProductForm = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(isEdit);
  const [saving,         setSaving]         = useState(false);
  const [varSaving,      setVarSaving]      = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error,          setError]          = useState('');
  const [toast,          setToast]          = useState('');
  const [tab,            setTab]            = useState('info');

  const [variants, setVariants] = useState([]);
  const [images,   setImages]   = useState([]);

  const toast$ = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const [form, setForm] = useState({
    categoryId: '', name: '', slug: '', shortDesc: '', description: '',
    isFeatured: false, isBestseller: false, isActive: true, metaTitle: '', metaDesc: '',
  });
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    categoriesService.getAll().then((r) => setCategories(r.data.data.categories));
  }, []);

  const loadProduct = async (productId) => {
    try {
      const r = await adminService.getProducts();
      const found = r.data.data.products.find((p) => p.id === productId);
      if (!found) { setError('Product not found'); return; }
      const full = await productsService.getBySlug(found.slug);
      const p = full.data.data.product;
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
    } catch { setError('Failed to load product'); }
    finally   { setLoading(false); }
  };

  useEffect(() => { if (isEdit) loadProduct(id); }, [id]);

  // Auto slug from name on create
  useEffect(() => {
    if (!isEdit && form.name && !form.slug) {
      setF('slug', form.name.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  }, [form.name]);

  const handleSaveBasic = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (isEdit) {
        await productsService.update(id, form);
        toast$('Saved');
        loadProduct(id);
      } else {
        const r = await productsService.create(form);
        const newId = r.data.data.product.id;
        toast$('Product created — add variants and images');
        navigate(`/products/${newId}/edit`, { replace: true });
      }
    } catch (err) { setError(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const saveVariant = async (existingId, vf) => {
    if (!isEdit) return toast$('Save product first');
    setVarSaving(true);
    try {
      const payload = {
        label: vf.label, weightGrams: Number(vf.weightGrams), price: Number(vf.price),
        mrp: Number(vf.mrp), sku: vf.sku, stockQty: Number(vf.stockQty),
        lowStockThreshold: Number(vf.lowStockThreshold || 5), sortOrder: Number(vf.sortOrder || 0),
      };
      existingId
        ? await productsService.updateVariant(id, existingId, payload)
        : await productsService.addVariant(id, payload);
      toast$(existingId ? 'Variant updated' : 'Variant added');
      loadProduct(id);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setVarSaving(false); }
  };

  const deleteVariant = async (v) => {
    if (!confirm(`Delete "${v.label}"?`)) return;
    if (!v.id) { setVariants((vs) => vs.filter((x) => x !== v)); return; }
    try { await productsService.deleteVariant(id, v.id); toast$('Deleted'); loadProduct(id); }
    catch { setError('Delete failed'); }
  };

  const handleImageUpload = async (e) => {
    if (!isEdit) return toast$('Save product first');
    const file = e.target.files[0]; if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('isPrimary', images.length === 0 ? 'true' : 'false');
    try { await productsService.uploadImage(id, fd); toast$('Uploaded'); loadProduct(id); }
    catch { setError('Upload failed'); }
    finally { setImageUploading(false); e.target.value = ''; }
  };

  const handleDeleteImage = async (img) => {
    if (!confirm('Delete this image?')) return;
    try { await productsService.deleteImage(id, img.id); toast$('Deleted'); loadProduct(id); }
    catch { setError('Delete failed'); }
  };

  if (loading) return <div className="text-center p-12 text-gray-400">Loading…</div>;

  const TABS = [
    { key: 'info',     label: 'Basic Info' },
    { key: 'variants', label: `Variants (${variants.length})` },
    { key: 'images',   label: `Images (${images.length})` },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/products" className="text-gray-400 hover:text-gray-600 text-xl font-light">←</Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between">
          {error} <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === t.key ? 'border-honey-500 text-honey-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {tab === 'info' && (
        <form onSubmit={handleSaveBasic} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Category" required>
              <select value={form.categoryId} onChange={(e) => setF('categoryId', e.target.value)}
                      required className="input-field">
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Product Name" required>
              <input value={form.name} onChange={(e) => setF('name', e.target.value)}
                     required className="input-field" placeholder="e.g. Pure Wild Forest Honey" />
            </Field>
          </div>
          <Field label="Slug" hint="Auto-generated. Lowercase letters, numbers and hyphens only.">
            <input value={form.slug} onChange={(e) => setF('slug', e.target.value)}
                   className="input-field font-mono" />
          </Field>
          <Field label="Short Description" hint="Shown in product cards (max 300 chars)">
            <input value={form.shortDesc} onChange={(e) => setF('shortDesc', e.target.value)}
                   className="input-field" maxLength={300} />
          </Field>
          <Field label="Full Description">
            <textarea value={form.description} onChange={(e) => setF('description', e.target.value)}
                      rows={5} className="input-field resize-y" />
          </Field>

          <div className="flex flex-wrap gap-5">
            {[
              { k: 'isFeatured',   l: 'Featured on homepage' },
              { k: 'isBestseller', l: 'Bestseller' },
              { k: 'isActive',     l: 'Active in store' },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[k]}
                       onChange={(e) => setF(k, e.target.checked)}
                       className="h-4 w-4 rounded text-honey-500" />
                <span className="text-sm text-gray-700">{l}</span>
              </label>
            ))}
          </div>

          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer select-none">SEO (optional)</summary>
            <div className="px-4 pb-4 pt-2 space-y-3">
              <Field label="Meta Title">
                <input value={form.metaTitle} onChange={(e) => setF('metaTitle', e.target.value)} className="input-field" />
              </Field>
              <Field label="Meta Description">
                <textarea value={form.metaDesc} onChange={(e) => setF('metaDesc', e.target.value)}
                          rows={2} className="input-field resize-none" />
              </Field>
            </div>
          </details>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <Link to="/products" className="btn-outline">Cancel</Link>
          </div>
        </form>
      )}

      {/* Variants */}
      {tab === 'variants' && (
        <div>
          {!isEdit && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
              Save the product first, then add variants.
            </div>
          )}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wide">
                <tr>
                  {['Label', 'Weight (g)', 'Price ₹', 'MRP ₹', 'SKU', 'Stock', ''].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {variants.map((v, i) => (
                  <VariantRow key={v.id || i} v={v} idx={i}
                              onSave={saveVariant} onDelete={deleteVariant}
                              onCancelNew={(idx) => setVariants((vs) => vs.filter((_, j) => j !== idx))}
                              varSaving={varSaving} />
                ))}
              </tbody>
            </table>
          </div>
          {isEdit && (
            <button onClick={() => setVariants((vs) => [...vs, emptyVariant()])}
                    className="mt-3 text-sm text-honey-600 hover:text-honey-700 font-medium">
              + Add Variant
            </button>
          )}
        </div>
      )}

      {/* Images */}
      {tab === 'images' && (
        <div>
          {!isEdit ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
              Save the product first, then upload images.
            </div>
          ) : (
            <div className="mb-5">
              <label className="cursor-pointer inline-flex items-center gap-2 btn-outline text-sm">
                {imageUploading ? 'Uploading…' : '+ Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload}
                       className="hidden" disabled={imageUploading} />
              </label>
              <p className="text-xs text-gray-400 mt-1">Max 5MB. First image auto-set as primary.</p>
            </div>
          )}
          {images.length === 0 ? (
            <p className="text-gray-400 text-sm">No images uploaded.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-100">
                  <img src={img.image_url} alt="" className="w-full aspect-square object-cover" />
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
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default ProductForm;
