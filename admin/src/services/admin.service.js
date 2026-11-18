import api from './api.js';

export const adminService = {
  getStats:      () => api.get('/admin/stats'),
  getProducts:   () => api.get('/admin/products'),
  getCategories: () => api.get('/admin/categories'),
};

export const productsService = {
  getBySlug:     (slug)                   => api.get(`/products/${slug}`),
  create:        (data)                   => api.post('/products', data),
  update:        (id, data)               => api.put(`/products/${id}`, data),
  delete:        (id)                     => api.delete(`/products/${id}`),
  uploadImage:   (id, fd)                 => api.post(`/products/${id}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage:   (id, imageId)            => api.delete(`/products/${id}/images/${imageId}`),
  addVariant:    (id, data)               => api.post(`/products/${id}/variants`, data),
  updateVariant: (id, variantId, data)    => api.put(`/products/${id}/variants/${variantId}`, data),
  deleteVariant: (id, variantId)          => api.delete(`/products/${id}/variants/${variantId}`),
};

export const categoriesService = {
  getAll:      ()         => api.get('/categories'),
  create:      (data)     => api.post('/categories', data),
  update:      (id, data) => api.put(`/categories/${id}`, data),
  delete:      (id)       => api.delete(`/categories/${id}`),
  uploadImage: (id, fd)   => api.post(`/categories/${id}/image`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
