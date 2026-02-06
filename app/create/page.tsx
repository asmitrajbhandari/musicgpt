'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSongStore } from '@/stores/songStore'
import { socketService } from '@/lib/socket'
import { generateRandomTitle } from '@/lib/utils/titleGenerator'
import { isValidPrompt } from '@/lib/utils/promptValidator'

export default function CreatePage() {
  const [input, setInput] = useState('')
  const { addMusicItem } = useSongStore()

  useEffect(() => {
    // Connect to Socket.IO server when component mounts
    socketService.connect()

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  const handleSubmit = async () => {
    console.log('🎵 Submit button clicked, input:', input)
    console.log('🔌 Socket connected:', socketService.isConnected())
    
    if (!input.trim()) {
      console.error('❌ Please enter a music prompt')
      return
    }

    try {
      // Create two items with unique timestamp + random IDs
      const random1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const random2 = Math.floor(Math.random() * 2000).toString().padStart(2, '0')
      
      const item1Id = `${Date.now()}${random1}`
      const item2Id = `${Date.now()}${random2}`
      
      // Generate random title for this song
      const songTitle = generateRandomTitle()
      
      // Generate random image number (1-4)
      const randomImageNumber = Math.floor(Math.random() * 4) + 1
      
      // Add both items to store immediately with custom IDs and versions
      addMusicItem(songTitle, input, item1Id, 'v1', randomImageNumber)
      addMusicItem(songTitle, input, item2Id, 'v2', randomImageNumber)
      
      // Only proceed with API call if prompt is valid
      if (!isValidPrompt(input)) {
        return
      }
      
      console.log('📤 Sending API request...')
      const response = await fetch('/api/create-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          itemIds: [item1Id, item2Id]
        })
      })

      const data = await response.json()
      console.log('📥 API response:', data)

      if (!data.success) {
        throw new Error(data.error || 'Failed to start song creation')
      }
      
      console.log('✅ Song creation started via API route')
      
      // Clear input after successful submission
      setInput('')
    } catch (error) {
      console.error('❌ Submit error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        <div className="flex flex-col gap-6">
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your music prompt..."
              className="w-full px-4 py-3 bg-[#212529] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit()
                }
              }}
            />
            <Button 
              onClick={handleSubmit}
              className="w-full"
            >
              Create Song
            </Button>
          </div>

          {/* Status Display */}
          {/* Status is now handled by MusicItem components in Profile dropdown */}
        </div>
      </div>
    </div>
  )
}
