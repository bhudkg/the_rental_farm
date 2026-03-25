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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  },
);

// ── Trees ──

export const fetchTrees = (filters = {}) => {
  const params = {};
  if (typeof filters === 'string') {
    if (filters) params.type = filters;
  } else {
    if (filters.type) params.type = filters.type;
    if (filters.price_min != null) params.price_min = filters.price_min;
    if (filters.price_max != null) params.price_max = filters.price_max;
    if (filters.size) params.size = filters.size;
    if (filters.maintenance != null) params.maintenance = filters.maintenance;
    if (filters.sort_by) params.sort_by = filters.sort_by;
    if (filters.search) params.search = filters.search;
  }
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

export const fetchMe = () => api.get('/auth/me').then((r) => r.data);

// ── Owner ──

export const fetchOwnerTrees = () => api.get('/owner/trees').then((r) => r.data);

export const fetchOwnerOrders = () => api.get('/owner/orders').then((r) => r.data);

export const fetchOwnerStats = () => api.get('/owner/stats').then((r) => r.data);

export default api;
