import React, { useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectProducts, selectProductsLoading, selectProductsError, selectProductsTotal, selectProductsTotalPages, selectProductsPage } from '../../features/products/productsSlice.js';
import { fetchCategories, selectCategories } from '../../features/categories/categoriesSlice.js';
import { addItem } from '../../features/cart/cartSlice.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const minPrice = Number(product.min_price);
  const maxMrp   = Number(product.max_mrp);
  const discount = maxMrp > minPrice ? Math.round((1 - minPrice / maxMrp) * 100) : 0;
  const inStock  = Number(product.total_stock) > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addItem({
      variantId:  null,  // first available variant — resolved on detail page
      productId:  product.id,
      name:       product.name,
      label:      '',
      price:      minPrice,
      quantity:   1,
      imageUrl:   product.primary_image,
    }));
  };

  return (
    <Link to={`/products/${product.slug}`}
          className="group card overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-honey-50 overflow-hidden">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.primary_image_alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍯</div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
        {product.is_featured && (
          <span className="absolute top-2 right-2 bg-honey-500 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-honey-600 font-medium uppercase tracking-wide mb-1">
          {product.category_name}
        </p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-honey-600 transition-colors">
          {product.name}
        </h3>
        {product.short_desc && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.short_desc}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-gray-900">₹{minPrice.toLocaleString('en-IN')}</span>
            {maxMrp > minPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{maxMrp.toLocaleString('en-IN')}</span>
            )}
          </div>
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="text-xs bg-honey-500 hover:bg-honey-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
              aria-label={`Add ${product.name} to cart`}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Products = () => {
  const dispatch    = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const products    = useSelector(selectProducts);
  const isLoading   = useSelector(selectProductsLoading);
  const error       = useSelector(selectProductsError);
  const total       = useSelector(selectProductsTotal);
  const totalPages  = useSelector(selectProductsTotalPages);
  const currentPage = useSelector(selectProductsPage);
  const categories  = useSelector(selectCategories);

  // Read filters from URL
  const page       = Number(searchParams.get('page'))     || 1;
  const category   = searchParams.get('category')         || '';
  const search     = searchParams.get('search')           || '';
  const sort       = searchParams.get('sort')             || 'newest';

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ page, category, search, sort, limit: 12 }));
  }, [dispatch, page, category, search, sort]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const val = e.target.elements.search.value.trim();
    setParam('search', val);
  }, [searchParams]);

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Categories
            </h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category ? 'bg-honey-50 text-honey-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setParam('category', cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.id ? 'bg-honey-50 text-honey-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                name="search"
                defaultValue={search}
                type="search"
                placeholder="Search products…"
                className="flex-1 input text-sm"
                aria-label="Search products"
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm">
                Search
              </button>
            </form>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="input text-sm w-auto"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name A–Z</option>
            </select>
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="text-sm text-gray-500 mb-4">
              {total > 0 ? `${total} product${total !== 1 ? 's' : ''} found` : ''}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🍯</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filters</p>
              <button onClick={() => setSearchParams({})} className="btn-outline text-sm">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn-outline text-sm px-3 py-2 disabled:opacity-40"
                aria-label="Previous page"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p}
                    onClick={() => handlePageChange(p)}
                    className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                      p === currentPage
                        ? 'bg-honey-500 text-white font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="btn-outline text-sm px-3 py-2 disabled:opacity-40"
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
