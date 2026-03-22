import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085';

// Create axios instance for URLs that start with /api
const apiWithPrefix = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for URLs that DON'T start with /api (like login)
const apiWithoutPrefix = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token (applied to both)
const addToken = (config) => {
  // Don't add token for login or register endpoints
  if (config.url.includes('/auth/login') || config.url.includes('/auth/register')) {
    return config;
  }

  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiWithPrefix.interceptors.request.use(addToken, (error) => Promise.reject(error));
apiWithoutPrefix.interceptors.request.use(addToken, (error) => Promise.reject(error));

// Response interceptor to handle token expiration
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

apiWithPrefix.interceptors.response.use((r) => r, handleAuthError);
apiWithoutPrefix.interceptors.response.use((r) => r, handleAuthError);

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  // Signup: http://localhost:8085/api/auth/register
  signup: (userData) =>
    apiWithPrefix.post('/auth/register', userData),

  // Login: http://localhost:8085/api/auth/login
  login: (credentials) =>
    apiWithPrefix.post('/auth/login', credentials),
};

// ============ USER ENDPOINTS ============
export const userAPI = {
  getCurrentProfile: () =>
    apiWithPrefix.get('/users/me'),

  updateProfile: (userData) =>
    apiWithPrefix.put('/users/me', userData),
};

// ============ VEHICLE ENDPOINTS ============
export const vehicleAPI = {
  getAllVehicles: (page = 0, size = 10, sort = 'createdAt,desc') =>
    apiWithPrefix.get('/vehicles', {
      params: { page, size, sort },
    }),

  getVehicleById: (id) =>
    apiWithPrefix.get(`/vehicles/${id}`),

  createVehicle: (vehicleData) =>
    apiWithPrefix.post('/vehicles', vehicleData),

  updateVehicle: (id, vehicleData) =>
    apiWithPrefix.put(`/vehicles/${id}`, vehicleData),

  deleteVehicle: (id) =>
    apiWithPrefix.delete(`/vehicles/${id}`),
};

// ============ CATEGORY ENDPOINTS ============
export const categoryAPI = {
  getAllCategories: () =>
    apiWithPrefix.get('/categories'),
};

// ============ AD ENDPOINTS ============
export const adAPI = {
  getActiveAds: () =>
    apiWithPrefix.get('/ads/active'),
};

// ============ SELLER ENDPOINTS ============
export const sellerAPI = {
  applySeller: (applicationData) =>
    apiWithPrefix.post('/sellers/apply', applicationData),

  getAllApplications: () =>
    apiWithPrefix.get('/sellers/applications'),

  registerShop: (shopData) =>
    apiWithPrefix.post('/sellers/register-shop', shopData),
};

// ============ FRAUD ENDPOINTS ============
export const fraudAPI = {
  reportFraud: (fraudData) =>
    apiWithPrefix.post('/fraud/reports', fraudData),

  getFraudReports: () =>
    apiWithPrefix.get('/fraud/reports'),
};

// ============ CONTACT ENDPOINTS ============
export const contactAPI = {
  sendMessage: (messageData) =>
    apiWithPrefix.post('/contact', messageData),
};

// ============ PRODUCT ENDPOINTS ============
export const productAPI = {
  getAllProducts: () =>
    apiWithPrefix.get('/products'),

  getProductById: (id) =>
    apiWithPrefix.get(`/products/${id}`),

  getMyProducts: () =>
    apiWithPrefix.get('/products/seller/me'),

  createProduct: (productData) =>
    apiWithPrefix.post('/products', productData),

  updateProduct: (id, productData) =>
    apiWithPrefix.put(`/products/${id}`, productData),

  deleteProduct: (id) =>
    apiWithPrefix.delete(`/products/${id}`),
};

// ============ MISC ENDPOINTS ============
export const miscAPI = {
  getFeaturedVehicles: () =>
    apiWithPrefix.get('/stats/featured'),

  getSearchSuggestions: (query) =>
    apiWithPrefix.get('/search/suggestions', {
      params: { q: query },
    }),
};

// ============ ADMIN ENDPOINTS ============
export const adminAPI = {
  adminHello: () =>
    apiWithPrefix.get('/admin/hello'),
};

// ============ ORDER ENDPOINTS ============
export const orderAPI = {
  placeOrder: (orderData) =>
    apiWithPrefix.post('/orders/place', orderData),

  getMyOrders: () =>
    apiWithPrefix.get('/orders/me'),

  getSellerOrders: () =>
    apiWithPrefix.get('/orders/seller'),

  acceptOrder: (orderId) =>
    apiWithPrefix.post(`/orders/${orderId}/accept`),

  declineOrder: (orderId) =>
    apiWithPrefix.post(`/orders/${orderId}/decline`),
};

// ============ NOTIFICATION ENDPOINTS ============
export const notificationAPI = {
  getMyNotifications: () =>
    apiWithPrefix.get('/notifications'),

  getUnreadCount: () =>
    apiWithPrefix.get('/notifications/unread-count'),

  markAsRead: (id) =>
    apiWithPrefix.post(`/notifications/${id}/read`),
};

// ============ AUTH HELPERS ============
export const authHelpers = {
  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  removeToken: () => {
    localStorage.removeItem('authToken');
  },

  setUserInfo: (userInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  },

  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  removeUserInfo: () => {
    localStorage.removeItem('userInfo');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  },
};

export default apiWithPrefix;
