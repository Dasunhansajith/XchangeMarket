import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { authHelpers } from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      if (!authHelpers.getToken()) return []; // Only load if we have a token
      const stored = localStorage.getItem('xchange_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('xchange_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);
  
  // Clear wishlist when user logs out
  useEffect(() => {
    if (!loading && !user) {
      setWishlistItems([]);
      localStorage.removeItem('xchange_wishlist');
    }
  }, [user, loading]);

  const addToWishlist = useCallback((product) => {
    v
    setWishlistItems((prev) => {
      const key = product.id || product.title || product.name;
      const exists = prev.some(
        (item) => (item.id || item.title || item.name) === key
      );
      if (exists) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((product) => {
    setWishlistItems((prev) => {
      const key = product.id || product.title || product.name;
      return prev.filter(
        (item) => (item.id || item.title || item.name) !== key
      );
    });
  }, []);

  const toggleWishlist = useCallback((product) => {
    const key = product.id || product.title || product.name;
    setWishlistItems((prev) => {
      const exists = prev.some(
        (item) => (item.id || item.title || item.name) === key
      );
      if (exists) {
        return prev.filter(
          (item) => (item.id || item.title || item.name) !== key
        );
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((product) => {
    const key = product.id || product.title || product.name;
    return wishlistItems.some(
      (item) => (item.id || item.title || item.name) === key
    );
  }, [wishlistItems]);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistItems.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
