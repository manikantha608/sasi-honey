import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductBySlug, clearSelected,
  selectSelectedProduct, selectSelectedLoading, selectSelectedError,
} from '../../features/products/productsSlice.js';
import { addItem } from '../../features/cart/cartSlice.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

// ─── Tab component ────────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-honey-500 text-honey-600'
        : 'border-transparent text-gray-500 hover:text-gray-800'
    }`}
  >
    {label}
  </button>
);

// ─── Stock badge ──────────────────────────────────────────────────────────────
const StockBadge = ({ qty, threshold }) => {
  if (qty === 0) return <span className="text-sm text-red-600 font-medium">Out of stock</span>;
  if (qty <= threshold) return <span className="text-sm text-orange-600 font-medium">Only {qty} left</span>;
  return <span className="text-sm text-green-600 font-medium">In stock</span>;
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ProductDetails = () => {
  const { slug }     = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const product      = useSelector(selectSelectedProduct);
  const isLoading    = useSelector(selectSelectedLoading);
  const error        = useSelector(selectSelectedError);

  const [activeImage,   setActiveImage]   = useState(0);
  const [activeVariant, setActiveVariant] = useState(0);
  const [qty,           setQty]           = useState(1);
  const [activeTab,     setActiveTab]     = useState('description');
  const [addedMsg,      setAddedMsg]      = useState('');

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearSelected());
  }, [dispatch, slug]);

  // Reset selections when product changes
  useEffect(() => {
    setActiveImage(0);
    setActiveVariant(0);
    setQty(1);
  }, [product?.id]);

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Product not found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  if (!product) return null;

  const images   = product.images   || [];
  const variants = product.variants || [];
  const variant  = variants[activeVariant] || null;

  const price   = variant ? Number(variant.price) : null;
  const mrp     = variant ? Number(variant.mrp)   : null;
  const discount= (price && mrp && mrp > price) ? Math.round((1 - price / mrp) * 100) : 0;
  const inStock = variant ? variant.stock_qty > 0 : false;

  const handleAddToCart = () => {
    if (!variant || !inStock) return;
    dispatch(addItem({
      variantId: variant.id,
      productId: product.id,
      name:      product.name,
      label:     variant.label,
      price:     price,
      quantity:  qty,
      imageUrl:  images[0]?.image_url || null,
    }));
    setAddedMsg('Added to cart!');
    setTimeout(() => setAddedMsg(''), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-honey-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-honey-600">Products</Link>
        <span>/</span>
        {product.category_name && (
          <>
            <Link to={`/products?category=${product.category_id}`} className="hover:text-honey-600">
              {product.category_name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Image Gallery ── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-honey-50 border border-gray-100">
            {images[activeImage] ? (
              <img
                src={images[activeImage].image_url}
                alt={images[activeImage].alt_text || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🍯</div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-honey-500' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-5">
          {/* Category + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-honey-600 font-semibold uppercase tracking-wide">
              {product.category_name}
            </span>
            {product.is_featured    && <span className="bg-honey-100 text-honey-700 text-xs font-medium px-2 py-0.5 rounded">Featured</span>}
            {product.is_bestseller  && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">Bestseller</span>}
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {product.short_desc && (
            <p className="text-gray-500 leading-relaxed">{product.short_desc}</p>
          )}

          {/* Price */}
          {variant && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {mrp > price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                  <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-0.5 rounded">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
          )}

          {/* Variants */}
          {variants.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Size / Weight
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveVariant(i)}
                    disabled={v.stock_qty === 0}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                      ${i === activeVariant
                        ? 'border-honey-500 bg-honey-50 text-honey-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }
                      ${v.stock_qty === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}
                    `}
                    aria-pressed={i === activeVariant}
                  >
                    {v.label}
                    <span className="block text-xs mt-0.5 font-normal text-gray-500">
                      ₹{Number(v.price).toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock status */}
          {variant && (
            <StockBadge qty={variant.stock_qty} threshold={variant.low_stock_threshold} />
          )}

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg leading-none"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(variant?.stock_qty || 10, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg leading-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-3 text-base"
              >
                {addedMsg || 'Add to Cart'}
              </button>
            </div>
          )}

          {!inStock && variant && (
            <p className="text-red-600 text-sm font-medium">
              This variant is currently out of stock.
            </p>
          )}

          {/* Delivery info */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
            {[
              { icon: '🚚', text: 'Free delivery on orders above ₹499' },
              { icon: '📦', text: 'Ships within 1–2 business days' },
              { icon: '🔄', text: '7-day easy returns' },
            ].map(({ icon, text }) => (
              <p key={text} className="text-sm text-gray-600 flex items-center gap-2">
                <span>{icon}</span>{text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-12">
        <div className="flex border-b border-gray-200 mb-6">
          <Tab label="Description"  active={activeTab === 'description'}  onClick={() => setActiveTab('description')} />
          <Tab label="Reviews"      active={activeTab === 'reviews'}      onClick={() => setActiveTab('reviews')} />
        </div>

        {activeTab === 'description' && (
          <div className="max-w-3xl">
            {product.description ? (
              <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No description available.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-sm">Reviews coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
