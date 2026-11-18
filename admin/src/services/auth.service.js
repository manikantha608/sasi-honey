import api from './api.js';

export const authService = {
  login:   (data) => api.post('/auth/login',   data),
  logout:  ()     => api.post('/auth/logout'),
  refresh: ()     => api.post('/auth/refresh'),
  me:      ()     => api.get('/auth/me'),
};
