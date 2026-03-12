import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ตั้งค่า default headers ที่สำคัญ
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// เพิ่ม token ลงใน headers ก่อนส่ง request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (username, email, password, confirmPassword) =>
    api.post('/auth/register', { username, email, password, confirmPassword }),
  
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  getCurrentUser: () =>
    api.get('/auth/me')
};

// Products APIs
export const productsAPI = {
  getAll: (category = '', search = '') =>
    api.get('/products', { params: { category, search } }),
  
  getById: (id) =>
    api.get(`/products/${id}`),
  
  create: (productData) =>
    api.post('/products', productData),
  
  update: (id, productData) =>
    api.put(`/products/${id}`, productData),
  
  delete: (id) =>
    api.delete(`/products/${id}`)
};

// Cart APIs
export const cartAPI = {
  getCart: () =>
    api.get('/cart'),
  
  addItem: (product_id, quantity) =>
    api.post('/cart/add', { product_id, quantity }),
  
  updateItem: (id, quantity) =>
    api.put(`/cart/${id}`, { quantity }),
  
  removeItem: (id) =>
    api.delete(`/cart/${id}`),
  
  clear: () =>
    api.delete('/cart')
};

// Orders APIs
export const ordersAPI = {
  getAll: () =>
    api.get('/orders'),
  
  getById: (id) =>
    api.get(`/orders/${id}`),
  
  create: (items, shipping_address, notes) =>
    api.post('/orders', { items, shipping_address, notes }),
  
  updateStatus: (id, status) =>
    api.put(`/orders/${id}`, { status })
};

// Admin APIs
export const adminAPI = {
  getUsers: () =>
    api.get('/admin/users'),
  
  getStats: () =>
    api.get('/admin/stats'),
  
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),
  
  resetPassword: (id) =>
    api.put(`/admin/users/${id}/reset-password`),
  
  updateUserRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role })
};

export default api;
