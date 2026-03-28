import React, { useState } from 'react';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * StripeCheckoutButton Component
 * 
 * Simplified component that redirects to Stripe Checkout (hosted payment page)
 * No card details collected on your website - everything handled by Stripe
 * 
 * Features:
 * - One-click redirect to Stripe hosted checkout
 * - Built-in 3D Secure / SCA handling
 * - Mobile-optimized payment form
 * - Multiple payment methods (Card, Apple Pay, Google Pay, etc)
 * - Automatic redirect back to success/cancel page
 * - Saves checkout data for order creation after payment
 * 
 * Props:
 * - amount: Payment amount
 * - currency: ISO currency code (USD, EUR, etc)
 * - description: Payment description
 * - email: Customer email for receipt
 * - orderId: Reference order ID
 * - checkoutData: Full checkout details (for localStorage)
 * - isProcessing: Parent component loading state
 */
export const StripeCheckoutButton = ({
  amount,
  currency = 'USD',
  description,
  email,
  orderId,
  checkoutData,
  isProcessing = false
}) => {
  const [loading, setLoading] = useState(false);

  /**
   * Handle checkout button click
   * Makes API call to create checkout session
   * Saves checkout data to localStorage for order creation
   * Redirects to Stripe Checkout URL
   */
  const handleCheckout = async () => {
    if (loading || isProcessing) return;

    setLoading(true);

    try {
      // Save checkout data to localStorage for PaymentSuccess page
      // This will be used to create order after payment
      if (checkoutData) {
        localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        console.log('Saved checkout data to localStorage');
      }

      // Call backend to create Checkout Session
      console.log('Creating Stripe Checkout Session...');
      
      const response = await paymentAPI.processStripePayment({
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        description: description,
        email: email,
        orderId: orderId,
        paymentMethod: "STRIPE"
      });

      if (!response.data.success) {
        // Clear saved data if request fails
        localStorage.removeItem('checkoutData');
        throw new Error(response.data.message || 'Failed to create checkout session');
      }

      const { checkout_url } = response.data;

      if (!checkout_url) {
        localStorage.removeItem('checkoutData');
        throw new Error('No checkout URL received from server');
      }

      console.log('Redirecting to Stripe Checkout...');
      
      // Redirect to Stripe Checkout page
      window.location.href = checkout_url;

    } catch (error) {
      console.error('Checkout initiation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start checkout';
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info Message */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          You'll be redirected to Stripe's secure payment page
        </p>
      </div>

      {/* Checkout Button */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${
          loading || isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white active:scale-95 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading || isProcessing ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            Preparing checkout...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Pay Rs {parseFloat(amount).toLocaleString()} with Stripe
          </>
        )}
      </button>

    </div>
  );
};

export default StripeCheckoutButton;
