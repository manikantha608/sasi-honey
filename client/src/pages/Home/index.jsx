import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
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
          <Link to="/products" className="btn-primary text-base px-8 py-3">
            Shop Now
          </Link>
          <Link to="/products" className="btn-outline text-base px-8 py-3">
            Explore Products
          </Link>
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
            { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered fresh to your doorstep across India within 3-5 business days.' },
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

    {/* Coming Soon Banner */}
    <section className="py-16 bg-honey-500">
      <div className="max-w-7xl mx-auto px-4 text-center text-white">
        <h2 className="font-display text-3xl font-bold mb-4">More features coming soon</h2>
        <p className="text-honey-100 mb-6">
          Products, cart, checkout and admin dashboard are being built. Stay tuned!
        </p>
        <Link to="/products" className="bg-white text-honey-600 font-semibold px-8 py-3 rounded-lg
                                        hover:bg-honey-50 transition-colors">
          Browse Products
        </Link>
      </div>
    </section>
  </div>
);

export default Home;
