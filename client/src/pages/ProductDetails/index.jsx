import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { slug } = useParams();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">Product: {slug}</h1>
      <div className="bg-honey-50 rounded-xl p-12 text-center">
        <p className="text-gray-600">Product details will be implemented in Phase 2.</p>
      </div>
    </div>
  );
};

export default ProductDetails;
