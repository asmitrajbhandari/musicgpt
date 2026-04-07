import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { addCredits } from '@/lib/firebase'

// Initialize Stripe lazily to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session_id = searchParams.get('session_id')
    const packageId = searchParams.get('package')

    console.log('Payment verification request:', { session_id, packageId })

    if (!session_id) {
      console.error('No session ID provided')
      return NextResponse.json({ error: 'No session ID' }, { status: 400 })
    }

    // Retrieve the session to verify payment
    console.log('Retrieving Stripe session...')
    const session = await getStripe().checkout.sessions.retrieve(session_id)
    console.log('Stripe session retrieved:', { 
      id: session.id, 
      payment_status: session.payment_status,
      metadata: session.metadata 
    })

    // Check if this session has already been processed
    if (session.metadata?.processed === 'true') {
      console.log('Session already processed, skipping credit addition')
      return NextResponse.json({ 
        success: true,
        creditsAdded: 0,
        message: 'Payment already processed'
      })
    }

    if (session.payment_status === 'paid' && session.metadata) {
      const { userId, credits, packageId: metaPackageId } = session.metadata
      
      console.log('Processing payment for user:', { 
        userId, 
        credits: credits, 
        packageId: metaPackageId,
        creditsType: typeof credits,
        parsedCredits: parseInt(credits)
      })
      
      if (userId && credits) {
        const creditsToAdd = parseInt(credits)
        await addCredits(userId, creditsToAdd)
        console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`)
        
        // Mark session as processed to prevent duplicate additions
        await getStripe().checkout.sessions.update(session_id, {
          metadata: {
            ...session.metadata,
            processed: 'true'
          }
        })
        
        return NextResponse.json({ 
          success: true,
          creditsAdded: creditsToAdd,
          message: 'Payment successful, credits added!'
        })
      } else {
        console.error('Missing userId or credits in metadata:', { userId, credits })
      }
    } else {
      console.log('Payment not completed or no metadata:', {
        payment_status: session.payment_status,
        metadata: session.metadata
      })
    }

    return NextResponse.json({ 
      success: false,
      message: 'Payment not completed or invalid session',
      debug: {
        payment_status: session.payment_status,
        metadata: session.metadata
      }
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
