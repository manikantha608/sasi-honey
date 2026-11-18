import api from './api.js';

export const productsService = {
  // ─── Public ──────────────────────────────────────────────────────────────
  getAll:        (params) => api.get('/products', { params }),
  getFeatured:   ()       => api.get('/products/featured'),
  getBestsellers:()       => api.get('/products/bestsellers'),
  getBySlug:     (slug)   => api.get(`/products/${slug}`),

  // ─── Admin ───────────────────────────────────────────────────────────────
  create:        (data)             => api.post('/products', data),
  update:        (id, data)         => api.put(`/products/${id}`, data),
  delete:        (id)               => api.delete(`/products/${id}`),

  uploadImage:   (id, formData)     => api.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage:   (id, imageId)      => api.delete(`/products/${id}/images/${imageId}`),

  addVariant:    (id, data)         => api.post(`/products/${id}/variants`, data),
  updateVariant: (id, variantId, data) => api.put(`/products/${id}/variants/${variantId}`, data),
  deleteVariant: (id, variantId)    => api.delete(`/products/${id}/variants/${variantId}`),
};

export const categoriesService = {
  getAll:      ()         => api.get('/categories'),
  getBySlug:   (slug)     => api.get(`/categories/${slug}`),

  // Admin
  create:      (data)     => api.post('/categories', data),
  update:      (id, data) => api.put(`/categories/${id}`, data),
  delete:      (id)       => api.delete(`/categories/${id}`),
  uploadImage: (id, formData) => api.post(`/categories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
