/**
 * Stripe Configuration
 * 
 * Contains Stripe public key and configuration settings
 * 
 * IMPORTANT: Always use your actual Stripe publishable key
 * Get it from: https://dashboard.stripe.com/apikeys
 * 
 * Test Key: pk_test_XXXXXXXXXX
 * Production Key: pk_live_XXXXXXXXXX
 */

// Stripe Publishable Key
// Replace with your actual Stripe publishable key
// This key is safe to expose to frontend (public key)
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51NUj1zIFXx0yJ5U6f8Qg5mKlLe7nJ8vH6kI9jF4pO1qR2sT3uV4wX5yZ6aB7cD8eE9fF';

/**
 * Stripe Configuration Object
 * Customize appearance and behavior of Stripe elements
 */
export const stripeOptions = {
  mode: 'payment',
  currency: 'usd',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      borderRadius: '8px',
      fontSizeBase: '14px'
    }
  }
};

/**
 * Get Stripe public key from environment or use test key
 * 
 * Set in .env.local:
 * VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
 */
export const getStripePublicKey = () => {
  return STRIPE_PUBLIC_KEY;
};

/**
 * Check if using Stripe test mode
 */
export const isStripeTestMode = () => {
  return STRIPE_PUBLIC_KEY.startsWith('pk_test_');
};

export default {
  STRIPE_PUBLIC_KEY,
  stripeOptions,
  getStripePublicKey,
  isStripeTestMode
};
