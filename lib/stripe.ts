import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe('pk_test_51TJCwJJtejE9Vwrr2dWO7rT423Tk0SGOKSYKW1it0BVJVGRR2JnCwgSYdHbU6ONGaODpuHXNAps7uW4M3tLF9yeL00GRJHZK74')

export const CREDIT_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 100,
    price: 999, // $9.99 in cents (for display)
    stripePrice: 1999, // $19.99 in cents (for Stripe payment)
    priceDisplay: '$9.99'
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    credits: 250, // UI credits
    stripeCredits: 200, // Stripe credits
    price: 1999, // $19.99 in cents (for display)
    stripePrice: 2999, // $29.99 in cents (for Stripe payment)
    priceDisplay: '$19.99'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 500,
    price: 3499, // $34.99 in cents (for display)
    stripePrice: 3999, // $39.99 in cents (for Stripe payment)
    priceDisplay: '$34.99'
  }
]
