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
    if (filters.state) params.state = filters.state;
    if (filters.city) params.city = filters.city;
    if (filters.variety) params.variety = filters.variety;
    if (filters.lat != null) params.lat = filters.lat;
    if (filters.lng != null) params.lng = filters.lng;
    if (filters.radius_km != null) params.radius_km = filters.radius_km;
  }
  return api.get('/trees', { params }).then((r) => r.data);
};

export const fetchFilterOptions = () =>
  api.get('/trees/filters').then((r) => r.data);

export const fetchTree = (id) => api.get(`/trees/${id}`).then((r) => r.data);

export const fetchTrendingTrees = (limit = 12) =>
  api.get('/trees/trending', { params: { limit } }).then((r) => r.data);

export const createTree = (data) => api.post('/trees', data).then((r) => r.data);

export const updateTree = (id, data) => api.put(`/trees/${id}`, data).then((r) => r.data);

export const deleteTree = (id) => api.delete(`/trees/${id}`);

// ── Orders ──

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data);

export const createBatchOrder = (data) => api.post('/orders/batch', data).then((r) => r.data);

export const fetchOrders = () => api.get('/orders').then((r) => r.data);

export const fetchOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);

export const verifyPayment = (orderId, paymentData) =>
  api.post(`/orders/${orderId}/payment/verify`, paymentData).then((r) => r.data);

export const verifyBatchPayment = (data) =>
  api.post('/orders/batch/verify', data).then((r) => r.data);

export const getPaymentStatus = (orderId) =>
  api.get(`/orders/${orderId}/payment-status`).then((r) => r.data);

export const cancelOrder = (orderId) =>
  api.post(`/orders/${orderId}/cancel`).then((r) => r.data);

// ── Wishlist ──

export const toggleWishlist = (treeId) =>
  api.post(`/wishlist/${treeId}`).then((r) => r.data);

export const fetchWishlist = () =>
  api.get('/wishlist').then((r) => r.data);

// ── Auth ──

export const register = (data) => api.post('/auth/register', data).then((r) => r.data);

export const login = (data) => api.post('/auth/login', data).then((r) => r.data);

export const googleLogin = (idToken) =>
  api.post('/auth/google', { id_token: idToken }).then((r) => r.data);

export const fetchMe = () => api.get('/auth/me').then((r) => r.data);

export const updatePhone = (phone) =>
  api.put('/auth/me/phone', { phone }).then((r) => r.data);

// ── Addresses ──

export const fetchAddresses = () => api.get('/addresses').then((r) => r.data);

export const createAddress = (data) => api.post('/addresses', data).then((r) => r.data);

export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data).then((r) => r.data);

export const deleteAddress = (id) => api.delete(`/addresses/${id}`);

export const setDefaultAddress = (id) => api.put(`/addresses/${id}/default`).then((r) => r.data);

// ── Owner Profile ──

export const fetchOwnerProfile = () => api.get('/owner/profile').then((r) => r.data);

export const createOwnerProfile = (data) => api.post('/owner/profile', data).then((r) => r.data);

export const updateOwnerProfile = (data) => api.put('/owner/profile', data).then((r) => r.data);

// ── Images ──

export const storeImageUrl = (imageUrl) =>
  api.post('/upload-image', { image_url: imageUrl }).then((r) => r.data);

// ── Ratings ──

export const submitRating = (data) =>
  api.post('/ratings', data).then((r) => r.data);

export const fetchOwnerRatings = (ownerId) =>
  api.get(`/ratings/owner/${ownerId}`).then((r) => r.data);

export const checkCanRate = (orderId) =>
  api.get(`/ratings/can-rate/${orderId}`).then((r) => r.data);

// ── Owner ──

export const fetchOwnerTrees = () => api.get('/owner/trees').then((r) => r.data);

export const fetchOwnerOrders = () => api.get('/owner/orders').then((r) => r.data);

export const fetchOwnerStats = () => api.get('/owner/stats').then((r) => r.data);

export const markOrderDelivered = (orderId) =>
  api.post(`/owner/orders/${orderId}/deliver`).then((r) => r.data);

export const activateOrder = (orderId) =>
  api.post(`/owner/orders/${orderId}/activate`).then((r) => r.data);

export const fetchPendingUpdates = () =>
  api.get('/owner/pending-updates').then((r) => r.data);

// ── Order Updates ──

export const postOrderUpdate = (orderId, data) =>
  api.post(`/orders/${orderId}/updates`, data).then((r) => r.data);

export const fetchOrderUpdates = (orderId) =>
  api.get(`/orders/${orderId}/updates`).then((r) => r.data);

// ── Order Status ──

export const confirmReceipt = (orderId) =>
  api.post(`/orders/${orderId}/status`, { new_status: 'completed' }).then((r) => r.data);

export const fetchOrderStatusLog = (orderId) =>
  api.get(`/orders/${orderId}/status-log`).then((r) => r.data);

// ── Notifications ──

export const fetchNotifications = (page = 1) =>
  api.get(`/notifications?page=${page}`).then((r) => r.data);

export const fetchUnreadCount = () =>
  api.get('/notifications/unread-count').then((r) => r.data);

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsRead = () =>
  api.put('/notifications/read-all').then((r) => r.data);

// ── Geocoding ──

const MAPPLS_TOKEN = import.meta.env.VITE_MAPPLS_TOKEN;

export const geocodeAddress = async (address) => {
  if (!address || !MAPPLS_TOKEN) return null;
  try {
    const res = await axios.get('https://search.mappls.com/search/address/geocode', {
      params: { address, access_token: MAPPLS_TOKEN },
    });
    const place = res.data?.results?.[0] ?? res.data?.copResults ?? res.data?.[0];
    if (place?.latitude && place?.longitude) {
      return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
    }
    if (place?.lat && place?.lng) {
      return { lat: parseFloat(place.lat), lng: parseFloat(place.lng) };
    }
    return null;
  } catch {
    return null;
  }
};

export const reverseGeocode = async (lat, lng) => {
  if (lat == null || lng == null) return null;
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json', 'accept-language': 'en', addressdetails: 1 },
      headers: { 'User-Agent': 'TheRentalFarm/1.0' },
    });
    const addr = res.data?.address;
    const displayName = res.data?.display_name || '';
    if (!addr) return null;

    const city = addr.city || addr.town || addr.state_district || addr.county || '';
    const state = addr.state || '';

    const stripFromArea = [state, addr.country].filter(Boolean);
    const area = displayName
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !stripFromArea.includes(s))
      .join(', ');

    return { city, state, area };
  } catch {
    return null;
  }
};

export default api;
