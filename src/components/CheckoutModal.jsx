import React, { useState, useEffect } from 'react';
import PromotionSelectionComponent from './PromotionSelectionComponent';

const CheckoutModal = ({ cartItems, subtotal, onPlaceOrder }) => {
  const [availablePromos, setAvailablePromos] = useState([]);
  const [selectedPromoId, setSelectedPromoId] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Fetch promotions based on sellers in cart
  useEffect(() => {
    const sellerIds = [...new Set(cartItems.map(item => item.sellerId))].join(',');
    const userId = "current_user_id"; // Replace with real user ID from auth context
    
    fetch(`/promotions/available?userId=${userId}&cart=${sellerIds}`)
      .then(res => res.json())
      .then(data => {
        setAvailablePromos(data);
        
        // @review: Rule #4 & #5 - Admin auto-apply / Welcome pre-select
        const adminPromo = data.find(p => p.createdBy === 'ADMIN' && !p.isExpired);
        if (adminPromo) {
          setSelectedPromoId(adminPromo.id);
        } else if (data.some(p => p.id === 'WELCOME_PROMO')) {
          setSelectedPromoId('WELCOME_PROMO');
        }
      });
  }, [cartItems]);

  // Recalculate discount when selection changes
  useEffect(() => {
    const promo = availablePromos.find(p => p.id === selectedPromoId);
    if (promo) {
      const discount = promo.discountType === 'PERCENTAGE' 
        ? (subtotal * promo.value) / 100 
        : promo.value;
      setAppliedDiscount(Math.min(discount, subtotal));
    } else {
      setAppliedDiscount(0);
    }
  }, [selectedPromoId, availablePromos, subtotal]);

  const handlePlaceOrder = () => {
    onPlaceOrder({
      promotionId: selectedPromoId,
      totalPrice: subtotal - appliedDiscount
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl max-w-2xl mx-auto shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      
      {/* Price Summary */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Total Summary</p>
          <div className="flex items-center gap-2 mt-1">
            {appliedDiscount > 0 && (
              <span className="text-gray-400 line-through text-lg">${subtotal}</span>
            )}
            <span className="text-2xl font-black text-gray-900">
              ${(subtotal - appliedDiscount).toFixed(2)}
            </span>
          </div>
        </div>
        {appliedDiscount > 0 && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Saved ${appliedDiscount.toFixed(2)}
          </div>
        )}
      </div>

      <PromotionSelectionComponent 
        promotions={availablePromos}
        selectedPromoId={selectedPromoId}
        onSelect={setSelectedPromoId}
      />

      <button
        onClick={handlePlaceOrder}
        className="w-full mt-8 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
      >
        Place Order
      </button>
    </div>
  );
};

export default CheckoutModal;
