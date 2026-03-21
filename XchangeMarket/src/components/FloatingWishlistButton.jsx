import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { CheckoutModal } from './VehicleCard';

const FloatingWishlistButton = () => {
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleBuyNow = (item) => {
    setSelectedProduct(item);
    setIsCheckoutOpen(true);
  };

  return createPortal(
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-rose-500 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-rose-500/40 hover:scale-110 transition-all duration-300"
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
        style={{ boxShadow: '0 8px 32px rgba(244, 63, 94, 0.35)' }}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>

        <AnimatePresence>
          {wishlistCount > 0 && (
            <motion.span
              key={wishlistCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-white text-rose-600 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-rose-500"
            >
              {wishlistCount}
            </motion.span>
          )}
        </AnimatePresence>

        {wishlistCount > 0 && (
          <span className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-20 pointer-events-none"></span>
        )}
      </motion.button>

      {/* Wishlist Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-80 max-h-[60vh] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
          >
            <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <h3 className="font-bold text-sm tracking-wide">My Wishlist</h3>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-sm font-medium">Your wishlist is empty</p>
                  <p className="text-xs text-gray-300 mt-1">Tap the heart on products to save them</p>
                </div>
              ) : (
                wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id || item.title || item.name || index}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group"
                  >
                    {item.image && (
                      <img src={item.image} alt={item.title || item.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.title || item.name}</p>
                      {item.price && <p className="text-xs font-semibold text-rose-500">{item.price}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuyNow(item); }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black rounded-lg transition-all shadow-sm hover:shadow-green-200 active:scale-95"
                        title="Buy Now"
                      >
                        BUY NOW
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(item); }}
                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal for Wishlist */}
      {selectedProduct && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProduct(null);
          }}
          product={{ title: selectedProduct.title || selectedProduct.name, image: selectedProduct.image }}
          priceRaw={selectedProduct.price || "0"}
          contactNumber={selectedProduct.contactNumber || "94770000000"}
        />
      )}
    </>,
    document.body
  );
};

export default FloatingWishlistButton;
