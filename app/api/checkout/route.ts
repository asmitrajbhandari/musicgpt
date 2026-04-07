import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe lazily to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  })
}

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId } = await request.json()

    console.log('Checkout request received:', { packageId, userId })

    if (!packageId || !userId) {
      return NextResponse.json(
        { error: 'Package ID and User ID are required' },
        { status: 400 }
      )
    }

    // Define credit packages (UI prices vs Stripe prices)
    const packages = {
      basic: { name: 'Basic Pack', credits: 100, price: 999, stripePrice: 1999 }, // UI: $9.99, Stripe: $19.99
      standard: { name: 'Standard Pack', credits: 250, stripeCredits: 200, price: 1999, stripePrice: 2999 }, // UI: 250 credits, Stripe: 200 credits
      premium: { name: 'Premium Pack', credits: 500, price: 3499, stripePrice: 3999 } // UI: $34.99, Stripe: $39.99
    }

    console.log('Available packages:', packages)
    console.log('Looking for packageId:', packageId)

    const selectedPackage = packages[packageId as keyof typeof packages]
    if (!selectedPackage) {
      console.error('Package not found:', packageId)
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      )
    }

    console.log('Selected package details:', selectedPackage)

    // Create Stripe checkout session
    console.log('Creating Stripe session with data:', {
      packageId,
      selectedPackage: packages[packageId as keyof typeof packages],
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/create?session_id={CHECKOUT_SESSION_ID}&package=${packageId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/create`
    })

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: `${selectedPackage.credits} credits for MusicGPT`,
            },
            unit_amount: selectedPackage.stripePrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/create?session_id={CHECKOUT_SESSION_ID}&package=${packageId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/create`,
      metadata: {
        userId,
        packageId,
        credits: (selectedPackage as any).stripeCredits?.toString() || selectedPackage.credits.toString(),
      },
    })

    console.log('Stripe session created successfully:', { 
      sessionId: session.id, 
      sessionUrl: session.url,
      metadata: {
        userId,
        packageId,
        credits: (selectedPackage as any).stripeCredits?.toString() || selectedPackage.credits.toString(),
      }
    })

    return NextResponse.json({ 
      sessionId: session.id,
      sessionUrl: session.url 
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
