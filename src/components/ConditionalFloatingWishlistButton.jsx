import React from 'react';
import { useLocation } from 'react-router-dom';
import FloatingWishlistButton from './FloatingWishlistButton';

const ConditionalFloatingWishlistButton = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    // Show wishlist only on home and products pages
    const allowedPaths = ['/', '/products'];
    const isAllowedPage = allowedPaths.includes(currentPath);

    // Hide if not on allowed pages
    if (!isAllowedPage) {
        return null;
    }

    return <FloatingWishlistButton />;
};

export default ConditionalFloatingWishlistButton;
