import api from './api.js';

export const adminService = {
  getStats:      ()         => api.get('/admin/stats'),
  getProducts:   ()         => api.get('/admin/products'),
  getCategories: ()         => api.get('/admin/categories'),
};
