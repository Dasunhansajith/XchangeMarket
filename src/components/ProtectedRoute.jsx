import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const SellerRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isSeller = user?.role === 'SELLER' || user?.role === 'ROLE_SELLER' || user?.roles?.includes('ROLE_SELLER') || user?.hasShop;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');

  if (!isAuthenticated || (!isSeller && !isAdmin)) {
    return <Navigate to="/become-seller" replace />;
  }

  return children;
};

