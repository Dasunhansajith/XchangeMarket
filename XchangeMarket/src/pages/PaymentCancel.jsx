import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

/**
 * PaymentCancel Component
 * 
 * Handles redirect when user cancels Stripe Checkout payment
 * Shows helpful message and options to retry or go back
 */
export const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Show cancel notification
    toast.error('Payment cancelled. Your order was not created.');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Cancel Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-center relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 112.05 8.236a6 6 0 0111.427 6.654z" clipRule="evenodd" />
              <path fill="white" d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-orange-100">Your payment was not completed</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
            <p className="text-sm text-orange-900 font-medium">What happened?</p>
            <p className="text-sm text-orange-800 mt-2">You cancelled the payment on Stripe's checkout page. No charges were made to your card.</p>
          </div>

          {/* Why This Might Happen */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">Common reasons:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You changed your mind about the purchase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Payment method issue or insufficient funds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Network connection interrupted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You wanted to review order details again</span>
              </li>
            </ul>
          </div>

          {/* Important Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">💡 Important:</p>
            <p className="text-xs text-gray-700">Your shopping cart and product selection have been saved. You can retry the payment whenever you're ready.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              ← Try Payment Again
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
            >
              Browse Products
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="text-xs font-medium text-indigo-900 mb-2">🆘 Need Help?</p>
            <p className="text-xs text-indigo-800 mb-2">If you have any questions about this payment or your order, please contact us:</p>
            <a href="mailto:support@xchange.com" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold underline">
              support@xchange.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-xs text-gray-600">
          <p>No charges have been made. You can return to your cart to continue shopping.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
