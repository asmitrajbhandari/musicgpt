'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSongStore } from '@/stores/songStore'
import { useWarningStore } from '@/stores/warningStore'
import { useInvalidPromptStore } from '@/stores/invalidPromptStore'
import { socketService } from '@/lib/socket'
import { generateRandomTitle } from '@/lib/utils/titleGenerator'
import { isValidPrompt } from '@/lib/utils/promptValidator'
import MusicList from '@/app/components/MusicList'
import Image from 'next/image'
import { TriangleAlert, Sparkles, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CircleButton from '@/app/components/ui/circle-button'
import RoundedButton from '@/app/components/ui/rounded-button'

export default function CreatePage() {
  const [input, setInput] = useState('')
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [isLyrics, setIsLyrics] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const { addMusicItem, musicItems } = useSongStore()
  const { showServerBusyWarning, setShowServerBusyWarning } = useWarningStore()
  const { invalidPrompts, addInvalidPrompt } = useInvalidPromptStore()
  
  // Placeholder slideshow
  const placeholders = [
    'Upbeat electronic track',
    'Birthday song for Sarah who turned 30',
    'Remix "Rolling in the deep by adel"'
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  
  // Count items that are currently generating (in progress) - only valid prompts
  const itemsInProgress = musicItems.filter(
    (item) => (item.status === 'generating' || item.status === 'pending') && isValidPrompt(item.prompt)
  ).length
 
  // Update warning state based on items in progress
  useEffect(() => {
    setShowServerBusyWarning(itemsInProgress > 4)
  }, [itemsInProgress, setShowServerBusyWarning])

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [placeholders.length])

  useEffect(() => {
    // Connect to Socket.IO server when component mounts
    socketService.connect()

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [])

  const handleSubmit = async () => {
    console.log('Submit button clicked, input:', input)
    console.log('Socket connected:', socketService.isConnected())
    
    if (!input.trim()) {
      console.error('Please enter a music prompt')
      return
    }

    try {
      // Check if prompt is valid, if not add to invalid prompts store
      if (!isValidPrompt(input)) {
        console.error('Invalid prompt: does not contain "song"')
        addInvalidPrompt(input)
        setInput('') // Clear input after adding invalid prompt
        return
      }

      // Check if adding 2 more items would exceed the limit (more than 4 items = more than 2 songs)
      if (itemsInProgress + 2 > 4) {
        console.error('Server is busy. Cannot create new song.')
        setShowServerBusyWarning(true)
        return
      }

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
      
      console.log('Sending API request...')
      const response = await fetch('/api/create-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          itemIds: [item1Id, item2Id]
        })
      })

      const data = await response.json()
      console.log('API response:', data)

      if (!data.success) {
        throw new Error(data.error || 'Failed to start song creation')
      }
      
      console.log('Song creation started via API route')
      
      // Clear input after successful submission
      setInput('')
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-[800px] px-8">
        
        {/* Main prompt section */}
        <div className="flex flex-col items-center justify-center min-h-[590px] gap-6">
          <h1 className="text-white text-2xl font-semibold text-center">
            Turn any idea into sound
          </h1>
          
          {/* Input Section */}
          <div className="flex flex-col rounded-3xl bg-[#1D2125] w-full neon-glow-container">
            <div className="neon-glow-overlay"></div>
            <div className="relative pt-5 px-5 min-h-[72px]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder=""
                className="w-full bg-transparent border-none text-white focus:outline-none resize-none relative z-10"
                rows={1}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              {!input && (
                <div className="absolute top-5 left-5 pointer-events-none overflow-hidden h-[72px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={placeholderIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="text-white/40"
                    >
                      {placeholders[placeholderIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* Lyrics Section - Expandable */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isLyrics ? 'max-h-40 pb-3 opacity-100 border-t border-white/10' : 'max-h-0 pb-0 opacity-0'
              }`}
            >
              <div className="flex flex-row items-center gap-3 px-5 pt-3">
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Add your lyrics"
                  className="flex-1 bg-transparent border-none text-white placeholder-white/30 focus:outline-none resize-none"
                  rows={1}
                />
                <button className="flex flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1d21] border border-white/10 hover:bg-[rgb(58,62,66)] transition-all duration-200 active:scale-95 whitespace-nowrap">
                  <Sparkles className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-sm font-semibold">Generate</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-row justify-between items-center px-5 pb-5 pt-3">
              <div className="flex flex-row gap-2">
                <CircleButton 
                  icon="/assets/svg/attachment.svg"
                  alt="Clear"
                  onClick={() => setInput('')}
                  iconOpacity={30}
                />
                <CircleButton 
                  icon="/assets/svg/controls.svg"
                  alt="Controls"
                  iconOpacity={30}
                />
                <RoundedButton 
                  icon="/assets/svg/instrumental.svg"
                  alt="Instruments"
                  text="Instrumental"
                  iconOpacity={30}
                  className="font-semibold text-white/30"
                  isActive={isInstrumental}
                  activeIcon="/assets/svg/instrumental-fill.svg"
                  onClick={() => setIsInstrumental(!isInstrumental)}
                />
                <RoundedButton 
                  icon="/assets/svg/icon-plus-white.svg"
                  alt="Add Lyrics"
                  text="Lyrics"
                  iconOpacity={30}
                  className="font-semibold text-white/30"
                  isActive={isLyrics}
                  onClick={() => setIsLyrics(!isLyrics)}
                />
              </div>
              <button 
                onClick={handleSubmit}
                disabled={showServerBusyWarning}
                className={`w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-200 group ${
                  showServerBusyWarning 
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-white/90 hover:scale-110 active:scale-90'
                }`}
              >
                <ArrowRight className={`w-5 h-5 text-black ${!showServerBusyWarning && 'group-hover:animate-[wiggle_0.5s_ease-in-out_infinite]'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Music Items Display - Only show valid prompts */}
        {musicItems.filter((item) => isValidPrompt(item.prompt)).length > 0 && (
          <div className="flex flex-col gap-4 mt-8">
            <h2 className="text-white text-xl font-semibold">Recent Generations</h2>
            {musicItems
              .filter((item) => isValidPrompt(item.prompt))
              .slice()
              .reverse()
              .map((item) => (
                <MusicList key={item.id} musicItem={item} />
              ))}
          </div>
        )}

        {/* Warning Section - Show when more than 2 items are processing */}
        {showServerBusyWarning && (
          <div className="flex flex-col gap-2 rounded-lg p-4 bg-[#EE0D37]/[0.08]">
            <div className="flex items-center gap-2">
              <TriangleAlert
                width={16}
                height={16}
                className="text-[#EE0D37]"
              />
              <span className="text-white text-sm text-[#EE0D37]">
                Oops! Server busy.
              </span>
            </div>
            <div className="text-white/60 text-sm">
              4.9K users in the queue.{" "}
              <span className="underline cursor-pointer hover:text-white transition-colors">
                Retry
              </span>
              .
            </div>
          </div>
        )}

        {/* Invalid Prompt Sections - Show from invalid prompts store */}
        {invalidPrompts.map((prompt, index) => (
          <div key={`invalid-${index}`} className="flex flex-row gap-2">
            <div className="w-[60px] h-[60px] min-w-[60px] flex-shrink-0 rounded-lg bg-[#D89C3A] flex items-center justify-center">
              <Image
                src="/assets/images/smiling-face.png"
                alt="Invalid prompt icon"
                width={36}
                height={36}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">
                Invalid Prompt
              </span>
              <span className="text-white/30 text-sm">
                Your prompt does not seem to be valid. Please provide a
                prompt related to song.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
