import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchFeaturedProducts,
  selectFeatured,
  selectFeaturedLoading,
} from '../../features/products/productsSlice.js';
import { addItem } from '../../features/cart/cartSlice.js';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const minPrice = Number(product.min_price);
  const maxMrp   = Number(product.max_mrp);
  const discount = maxMrp > minPrice ? Math.round((1 - minPrice / maxMrp) * 100) : 0;

  return (
    <Link to={`/products/${product.slug}`}
          className="group card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-honey-50 overflow-hidden">
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍯</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-honey-600 font-medium uppercase mb-1">{product.category_name}</p>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-honey-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">₹{minPrice.toLocaleString('en-IN')}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{maxMrp.toLocaleString('en-IN')}</span>
            )}
          </div>
          {discount > 0 && (
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded">
              {discount}% off
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Home = () => {
  const dispatch  = useDispatch();
  const featured  = useSelector(selectFeatured);
  const isLoading = useSelector(selectFeaturedLoading);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-honey-50 to-amber-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-honey-600 font-semibold uppercase tracking-widest text-sm mb-3">
            100% Pure &amp; Natural
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Nature&apos;s Golden Gift,<br />
            <span className="text-honey-500">Straight From the Hive</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover our range of pure honey products sourced directly from trusted beekeepers
            across India — raw, unprocessed and full of natural goodness.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products" className="btn-primary text-base px-8 py-3">Shop Now</Link>
            <Link to="/products?featured=true" className="btn-outline text-base px-8 py-3">View Featured</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '🌿', title: 'Raw & Natural', desc: 'Cold-extracted, unprocessed honey that retains all natural enzymes and nutrients.' },
              { icon: '🐝', title: 'Ethically Sourced', desc: 'Partnered with local beekeepers who follow sustainable and ethical practices.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered fresh to your doorstep across India within 3–5 business days.' },
            ].map((f) => (
              <div key={f.title} className="card p-8">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-honey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-500 mt-1">Handpicked favourites from our collection</p>
            </div>
            <Link to="/products" className="btn-outline text-sm hidden sm:inline-flex">
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No featured products yet.</p>
              <Link to="/products" className="btn-primary mt-4 inline-block">Browse All Products</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <div className="text-center mt-8">
                <Link to="/products" className="btn-primary px-10 py-3">
                  Shop All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-honey-500">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-4">Pure Honey, Delivered to You</h2>
          <p className="text-honey-100 mb-6">
            Free delivery on orders above ₹499. 7-day easy returns.
          </p>
          <Link to="/products" className="bg-white text-honey-600 font-semibold px-8 py-3 rounded-lg
                                          hover:bg-honey-50 transition-colors inline-block">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
