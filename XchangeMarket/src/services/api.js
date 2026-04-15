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
    apiWithPrefix.post('/users/me', userData),

  deleteProfile: () =>
    apiWithPrefix.delete('/users/me'),

  getAllUsers: () =>
    apiWithPrefix.get('/users'),
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

  getUserApplication: () =>
    apiWithPrefix.get('/sellers/application/user'),

  getSalesReport: (startDate, endDate) =>
    apiWithPrefix.get('/sellers/sales-report', {
      params: { startDate, endDate }
    }),
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
  getAllProducts: (page = 0, size = 20, sort = 'createdAt,desc') =>
    apiWithPrefix.get('/products', {
      params: { page, size, sort },
    }),

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

  getUserApplication: () =>
    apiWithPrefix.get('/sellers/application/user'),

  getPendingApplications: () =>
    apiWithPrefix.get('/sellers/applications/pending'),

  approveApplication: (applicationId) =>
    apiWithPrefix.post(`/sellers/applications/${applicationId}/approve`),

  rejectApplication: (applicationId, data) =>
    apiWithPrefix.post(`/sellers/applications/${applicationId}/reject`, data),
};

// ============ ADMIN ENDPOINTS ============
export const adminAPI = {
  adminHello: () =>
    apiWithPrefix.get('/admin/hello'),

  getPendingSellerApplications: () =>
    apiWithPrefix.get('/sellers/applications/pending'),

  getAllSellerApplications: () =>
    apiWithPrefix.get('/sellers/applications'),

  approveSellerApplication: (applicationId) =>
    apiWithPrefix.post(`/sellers/applications/${applicationId}/approve`),

  rejectSellerApplication: (applicationId, data) =>
    apiWithPrefix.post(`/sellers/applications/${applicationId}/reject`, data),

  deleteSellerApplication: (applicationId) =>
    apiWithPrefix.delete(`/sellers/applications/${applicationId}`),

  getAllShops: () =>
    apiWithPrefix.get('/admin/shops'),

  deleteShop: (shopId) =>
    apiWithPrefix.delete(`/admin/shops/${shopId}`),

  getAllOrders: () =>
    apiWithPrefix.get('/admin/orders'),

  updateUserRole: (userId, role) =>
    apiWithPrefix.post(`/admin/users/${userId}/role`, { role }),

  removeUserRole: (userId, role) =>
    apiWithPrefix.delete(`/admin/users/${userId}/role`, { data: { role } }),

  deleteUser: (userId) =>
    apiWithPrefix.delete(`/admin/users/${userId}`),
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

  createTracking: (orderId) =>
    apiWithPrefix.post(`/orders/${orderId}/tracking`),

  declineOrder: (orderId) =>
    apiWithPrefix.post(`/orders/${orderId}/decline`),

  submitReview: (orderId, reviewData) =>
    apiWithPrefix.post(`/orders/${orderId}/review`, reviewData),

  editReview: (orderId, reviewData) =>
    apiWithPrefix.put(`/orders/${orderId}/review`, reviewData),

  deleteReview: (orderId) =>
    apiWithPrefix.delete(`/orders/${orderId}/review`),

  getTracking: (orderId) =>
    apiWithPrefix.get(`/orders/${orderId}/tracking`),

  updateTracking: (orderId, trackingData) =>
    apiWithPrefix.put(`/orders/${orderId}/tracking`, trackingData),
  confirmDelivery: (orderId) =>
    apiWithPrefix.put(`/orders/${orderId}/tracking/confirm-delivery`),
};

// ============ REVIEW ENDPOINTS ============
export const reviewAPI = {
  getProductReviews: (productId) =>
    apiWithPrefix.get(`/reviews/product/${productId}`),

  createReview: (reviewData) =>
    apiWithPrefix.post('/reviews', reviewData),

  updateReview: (reviewId, reviewData) =>
    apiWithPrefix.put(`/reviews/${reviewId}`, reviewData),

  deleteReview: (reviewId) =>
    apiWithPrefix.delete(`/reviews/${reviewId}`),
};

// ============ NOTIFICATION ENDPOINTS ============
export const notificationAPI = {
  getMyNotifications: () =>
    apiWithPrefix.get('/notifications'),

  getUnreadNotifications: () =>
    apiWithPrefix.get('/notifications/unread'),

  getUnreadCount: () =>
    apiWithPrefix.get('/notifications/unread-count'),

  markAsRead: (id) =>
    apiWithPrefix.post(`/notifications/${id}/read`),
};

// ============ PAYMENT ENDPOINTS ============
export const paymentAPI = {
  // Get all available payment methods
  getPaymentMethods: () =>
    apiWithPrefix.get('/payments/methods'),

  // Check if a specific payment method is available
  checkPaymentMethodAvailable: (paymentMethod) =>
    apiWithPrefix.get(`/payments/methods/${paymentMethod}/available`),

  // Process payment using any payment method
  processPayment: (paymentData) =>
    apiWithPrefix.post('/payments/process', paymentData),

  // Convenience endpoint for Stripe payments (creates Checkout Session)
  processStripePayment: (paymentData) =>
    apiWithPrefix.post('/payments/stripe', paymentData),

  // Verify Stripe Checkout Session (called after payment redirect)
  verifyCheckoutSession: (sessionId) =>
    apiWithPrefix.post('/payments/stripe/verify', { session_id: sessionId }),
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


  deleteNotification: (id) =>
    apiWithPrefix.delete(`/notifications/${id}`),
};

export default apiWithPrefix;
