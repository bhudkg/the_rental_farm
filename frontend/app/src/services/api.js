import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Trees ──

export const fetchTrees = (type) => {
  const params = type ? { type } : {};
  return api.get('/trees', { params }).then((r) => r.data);
};

export const fetchTree = (id) => api.get(`/trees/${id}`).then((r) => r.data);

export const createTree = (data) => api.post('/trees', data).then((r) => r.data);

export const updateTree = (id, data) => api.put(`/trees/${id}`, data).then((r) => r.data);

export const deleteTree = (id) => api.delete(`/trees/${id}`);

// ── Availability ──

export const checkAvailability = (treeId, startDate, endDate) =>
  api
    .post(`/trees/${treeId}/availability`, {
      start_date: startDate,
      end_date: endDate,
    })
    .then((r) => r.data);

// ── Orders ──

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);

export const fetchOrders = () => api.get('/orders').then((r) => r.data);

export const fetchOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);

// ── Auth ──

export const register = (data) => api.post('/auth/register', data).then((r) => r.data);

export const login = (data) => api.post('/auth/login', data).then((r) => r.data);

export default api;
