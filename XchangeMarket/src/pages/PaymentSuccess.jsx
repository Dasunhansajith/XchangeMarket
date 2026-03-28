import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { paymentAPI, orderAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * PaymentSuccess Component
 * 
 * Handles redirect after successful Stripe Checkout payment
 * Flow:
 * 1. User completes payment on Stripe page
 * 2. Redirected here with session_id in URL
 * 3. Verify session with backend
 * 4. Create order with payment info
 * 5. Show success message and option to view order
 */
export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPaymentAndCreateOrder = async () => {
      try {
        if (!sessionId) {
          throw new Error('No session ID found. Payment verification failed.');
        }

        console.log('Verifying payment session:', sessionId);

        // Step 1: Verify the checkout session with backend
        const verifyResponse = await paymentAPI.verifyCheckoutSession(sessionId);

        if (!verifyResponse.data.success) {
          throw new Error(verifyResponse.data.message || 'Payment verification failed');
        }

        const paymentInfo = verifyResponse.data;
        console.log('Payment verified successfully:', paymentInfo);

        // Step 2: Extract order details from session metadata
        const metadata = paymentInfo.metadata || {};
        
        // Get shipping details from localStorage (saved before checkout)
        const savedCheckoutData = localStorage.getItem('checkoutData');
        if (!savedCheckoutData) {
          throw new Error('Checkout data not found. Please try placing order again.');
        }

        const checkoutData = JSON.parse(savedCheckoutData);

        // Step 3: Create order
        console.log('Creating order with payment info...');

        const orderPayload = {
          productId: checkoutData.productId,
          quantity: checkoutData.quantity || 1,
          shippingAddress: checkoutData.shippingAddress,
          buyerName: checkoutData.buyerName,
          buyerPhone: checkoutData.buyerPhone,
          paymentMethod: 'STRIPE'
        };

        console.log('Order payload:', orderPayload);
        const orderResponse = await orderAPI.placeOrder(orderPayload);

        if (orderResponse.data) {
          console.log('Order created successfully:', orderResponse.data);
          setOrderData(orderResponse.data);
          setSuccess(true);

          // Clear saved checkout data
          localStorage.removeItem('checkoutData');

          // Show success toast
          toast.success('Payment successful! Order placed successfully!');
        } else {
          throw new Error('Failed to create order');
        }

      } catch (err) {
        console.error('Error in payment verification:', err);
        console.error('Full error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while processing your payment';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      // Small delay to let user see loading state
      const timer = setTimeout(() => {
        verifyPaymentAndCreateOrder();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Verifying your payment and creating order...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3 flex flex-col">
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              Back to Products
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-green-100">Your order has been placed</p>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4">
          {/* Transaction ID */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 font-medium mb-1">Transaction ID</p>
            <p className="text-lg font-mono font-bold text-gray-800 break-all">{sessionId}</p>
          </div>

          {/* Order Summary */}
          {orderData && (
            <div className="space-y-3 bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Order Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Order ID</span>
                  <span className="font-semibold text-gray-900">{orderData._id || 'Created'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-200 text-green-800">
                    ✓ Confirmed
                  </span>
                </div>
                {orderData.totalPrice && (
                  <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="font-bold text-green-600">Rs {orderData.totalPrice}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        
          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              onClick={() => navigate('/products')}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
            >
              View My Orders
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-600">
          <p>A confirmation email has been sent to your registered email address.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
