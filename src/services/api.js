import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  signup: (userData) =>
    apiClient.post('/auth/signup', userData),
  
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),
};

// ============ USER ENDPOINTS ============
export const userAPI = {
  getCurrentProfile: () =>
    apiClient.get('/users/me'),
  
  updateProfile: (userData) =>
    apiClient.put('/users/me', userData),
};

// ============ VEHICLE ENDPOINTS ============
export const vehicleAPI = {
  // Get all vehicles with pagination
  getAllVehicles: (page = 0, size = 10, sort = 'createdAt,desc') =>
    apiClient.get('/vehicles', {
      params: { page, size, sort },
    }),
  
  // Get single vehicle by ID
  getVehicleById: (id) =>
    apiClient.get(`/vehicles/${id}`),
  
  // Create new vehicle (Protected)
  createVehicle: (vehicleData) =>
    apiClient.post('/vehicles', vehicleData),
  
  // Update vehicle (Protected - Owner Only)
  updateVehicle: (id, vehicleData) =>
    apiClient.put(`/vehicles/${id}`, vehicleData),
  
  // Delete vehicle (Protected - Owner Only)
  deleteVehicle: (id) =>
    apiClient.delete(`/vehicles/${id}`),
};

// ============ CATEGORY ENDPOINTS ============
export const categoryAPI = {
  getAllCategories: () =>
    apiClient.get('/categories'),
};

// ============ AD ENDPOINTS ============
export const adAPI = {
  getActiveAds: () =>
    apiClient.get('/ads/active'),
};

// ============ SELLER ENDPOINTS ============
export const sellerAPI = {
  // Apply as seller (Protected)
  applySeller: (applicationData) =>
    apiClient.post('/sellers/apply', applicationData),
  
  // Get all applications (Admin Only)
  getAllApplications: () =>
    apiClient.get('/sellers/applications'),
};

// ============ FRAUD ENDPOINTS ============
export const fraudAPI = {
  // Report fraud (Protected)
  reportFraud: (fraudData) =>
    apiClient.post('/fraud/reports', fraudData),
  
  // Get all fraud reports (Protected)
  getFraudReports: () =>
    apiClient.get('/fraud/reports'),
};

// ============ CONTACT ENDPOINTS ============
export const contactAPI = {
  sendMessage: (messageData) =>
    apiClient.post('/contact', messageData),
};

// ============ MISC ENDPOINTS ============
export const miscAPI = {
  // Get featured vehicles
  getFeaturedVehicles: () =>
    apiClient.get('/stats/featured'),
  
  // Search suggestions
  getSearchSuggestions: (query) =>
    apiClient.get('/search/suggestions', {
      params: { q: query },
    }),
};

// ============ ADMIN ENDPOINTS ============
export const adminAPI = {
  adminHello: () =>
    apiClient.get('/admin/hello'),
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

export default apiClient;
