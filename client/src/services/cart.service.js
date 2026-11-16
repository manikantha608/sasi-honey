import api from './api.js';

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (variantId, quantity) => api.post('/cart/items', { variantId, quantity }),
  updateItem: (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};
