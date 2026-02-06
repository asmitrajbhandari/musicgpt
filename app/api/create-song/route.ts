import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, itemIds } = body
    
    console.log('📥 API Route - Received:', { prompt, itemIds })
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Send HTTP POST to socket server
    const socketServerUrl = 'http://localhost:3001/create-song'
    
    const response = await fetch(socketServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, itemIds })
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error || 'Failed to start song creation')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Song creation started',
      prompt,
      itemIds
    })
  } catch (error) {
    console.error('Create song API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Create song API endpoint. Use POST to create songs.' 
  })
}
