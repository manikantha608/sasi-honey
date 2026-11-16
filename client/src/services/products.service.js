import api from './api.js';

export const productsService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeatured: () => api.get('/products?featured=true'),
  getBestsellers: () => api.get('/products?bestseller=true'),
};

export const categoriesService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};
