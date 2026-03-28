import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * StripePaymentForm Component
 * 
 * Handles Stripe card payment processing
 * Uses Stripe.js CardElement for PCI-compliant card input
 * 
 * Props:
 * - amount: Payment amount
 * - currency: ISO currency code (USD, EUR, etc)
 * - description: Payment description
 * - email: Customer email
 * - orderId: Reference order ID
 * - onSuccess: Callback when payment succeeds
 * - onError: Callback when payment fails
 * - isProcessing: Parent component loading state
 */
export const StripePaymentForm = ({
  amount,
  currency = 'USD',
  description,
  email,
  orderId,
  onSuccess,
  onError,
  isProcessing = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  /**
   * Handle card element changes (validation, focus, etc)
   */
  const handleCardChange = (event) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError('');
    }
  };

  /**
   * Handle payment submission
   * Flow:
   * 1. Create PaymentIntent on backend
   * 2. Confirm payment with Stripe.js
   * 3. Handle success/error
   */
  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      toast.error('Card element not found');
      return;
    }

    setLoading(true);
    setCardError('');

    try {
      // Step 1: Request PaymentIntent from backend
      console.log('Requesting PaymentIntent from backend...');
      
      const paymentResponse = await paymentAPI.processStripePayment({
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        description: description,
        email: email,
        orderId: orderId
      });

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Failed to create payment intent');
      }

      const { client_secret, paymentIntentId } = paymentResponse.data;

      console.log('PaymentIntent created:', paymentIntentId);

      // Step 2: Confirm payment with Stripe
      console.log('Confirming payment with Stripe...');
      
      const confirmResult = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email,
            name: 'Customer'
          }
        }
      });

      if (confirmResult.error) {
        // Payment failed
        console.error('Payment confirmation error:', confirmResult.error);
        setCardError(confirmResult.error.message);
        if (onError) {
          onError(confirmResult.error.message);
        }
        toast.error(`Payment failed: ${confirmResult.error.message}`);
      } else if (confirmResult.paymentIntent) {
        const paymentIntent = confirmResult.paymentIntent;

        if (paymentIntent.status === 'succeeded') {
          // Payment successful
          console.log('Payment succeeded!', paymentIntent.id);
          toast.success('Payment successful!');
          
          if (onSuccess) {
            onSuccess({
              transactionId: paymentIntent.id,
              paymentIntentId: paymentIntentId,
              status: 'succeeded'
            });
          }
        } else if (paymentIntent.status === 'requires_action') {
          // Additional action required (3D Secure, etc)
          console.log('Additional action required');
          setCardError('Please complete the additional verification');
          if (onError) {
            onError('3D Secure verification required');
          }
          toast.error('Please complete the verification');
        } else {
          console.log('Payment status:', paymentIntent.status);
          setCardError('Unexpected payment status: ' + paymentIntent.status);
          if (onError) {
            onError('Unexpected payment status');
          }
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed';
      setCardError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Card element styling to match your design
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '24px'
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      {/* Card Element */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        <CardElement
          options={cardElementOptions}
          onChange={handleCardChange}
        />
      </div>

      {/* Error Message */}
      {cardError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {cardError}
          </p>
        </div>
      )}

      {/* Info Message */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          💳 Your card details are secure and encrypted. We never store your full card information.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isProcessing || !stripe || !elements}
        className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
          loading || isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
        }`}
      >
        {(loading || isProcessing) ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Processing Payment...
          </>
        ) : (
          `Pay Rs ${parseFloat(amount).toLocaleString()}`
        )}
      </button>

      {/* Test Card Info */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-700 font-medium">
          ℹ️ Test Card (Dev): 4242 4242 4242 4242 | Exp: 12/25 | CVC: 123
        </p>
      </div>
    </form>
  );
};

export default StripePaymentForm;
