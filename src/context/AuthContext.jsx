import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI, authHelpers } from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = authHelpers.getToken();
    const storedUserInfo = authHelpers.getUserInfo();

    if (storedToken && storedUserInfo) {
      setToken(storedToken);
      setUser(storedUserInfo);
    }
    setLoading(false);
  }, []);

  // Signup
  const signup = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signup(userData);
      const token = response.data.token || response.data.accessToken;
      const user = response.data.user || response.data;

      if (token) {
        authHelpers.setToken(token);
        authHelpers.setUserInfo(user);
        setToken(token);
        setUser(user);
        toast.success('Signup successful!');
        return { success: true, data: response.data };
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Signup failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response.data);

      const token = response.data.token || response.data.accessToken;
      const user = response.data.user || response.data;

      if (token) {
        authHelpers.setToken(token);
        authHelpers.setUserInfo(user);
        setToken(token);
        setUser(user);
        toast.success('Login successful!');
        return { success: true, data: response.data };
      } else {
        throw new Error('Invalid credentials or no token received');
      }
    } catch (err) {
      console.error('Login error details:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authHelpers.logout();
    setToken(null);
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
  }, []);

  // Get current user profile
  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getCurrentProfile();
      const userData = response.data;

      authHelpers.setUserInfo(userData);
      setUser(userData);
      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile(userData);
      const updatedUser = response.data;

      authHelpers.setUserInfo(updatedUser);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return { success: true, data: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced setUser that also updates localStorage
  const updateUserInfo = useCallback((newUserInfo) => {
    if (typeof newUserInfo === 'function') {
      setUser(prev => {
        const updated = newUserInfo(prev);
        authHelpers.setUserInfo(updated);
        return updated;
      });
    } else {
      authHelpers.setUserInfo(newUserInfo);
      setUser(newUserInfo);
    }
  }, []);

  const value = {
    user,
    setUser: updateUserInfo,
    token,
    loading,
    error,
    signup,
    login,
    logout,
    getCurrentUser,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Import userAPI for getCurrentUser and updateUser
import { userAPI } from '../services/api';
