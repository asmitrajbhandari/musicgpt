'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useSongStore } from '@/stores/songStore'
import { useWarningStore } from '@/stores/warningStore'
import { useInvalidPromptStore } from '@/stores/invalidPromptStore'
import { useMusicPlayerStore } from '@/stores/musicPlayerStore'
import { socketService } from '@/lib/socket'
import { generateRandomTitle } from '@/lib/utils/titleGenerator'
import { isValidPrompt } from '@/lib/utils/promptValidator'
import MusicList from '@/app/components/MusicList'
import MusicPlayer from '@/app/components/MusicPlayer'
import Image from 'next/image'
import { TriangleAlert, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CircleButton from '@/app/components/ui/circle-button'
import RoundedButton from '@/app/components/ui/rounded-button'
import { useCredits } from '@/hooks/useCredits'
import { GPT_CONSTANTS } from '@/app/utils/gptConstants'
import { useAuth } from '@/contexts/AuthContext'

export default function CreatePage() {
  const [input, setInput] = useState('')
  const [isInstrumental, setIsInstrumental] = useState(false)
  const [isLyrics, setIsLyrics] = useState(false)
  const [lyrics, setLyrics] = useState('')
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false)
  const { addMusicItem, musicItems, loadUserSongs } = useSongStore()
  const { showServerBusyWarning, setShowServerBusyWarning } = useWarningStore()
  const { invalidPrompts, addInvalidPrompt } = useInvalidPromptStore()
  const { isVisible: isPlayerVisible, currentTrack } = useMusicPlayerStore()
  const { credits, deductSongCredits, refreshCredits } = useCredits()
  const { user } = useAuth()
  const [paymentMessage, setPaymentMessage] = useState('')
  const [verifyingSession, setVerifyingSession] = useState<string | null>(null)
  
  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isTypingAnimation, setIsTypingAnimation] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [promptSource, setPromptSource] = useState<'create-song' | 'random' | 'manual'>('manual')
  
  // Prompt suggestions
  const promptSuggestions = [
    'Generate R&B track with smooth vocals',
    'Create upbeat electronic dance track',
    'Make acoustic folk song with guitar',
    'Produce hip-hop beat with bass',
    'Write pop song with catchy chorus',
    'Create jazz instrumental with saxophone',
    'Generate rock anthem with electric guitar',
    'Make ambient meditation music',
    'Create classical piano composition',
    'Produce reggae track with island vibes',
    'Generate blues song with harmonica',
    'Create country song with storytelling',
    'Make EDM festival banger',
    'Produce lo-fi study beats',
    'Create heavy metal guitar riff'
  ]
  
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

  // Check for payment success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const session_id = urlParams.get('session_id')
    const packageId = urlParams.get('package')

    if (session_id && !verifyingSession) {
      setVerifyingSession(session_id)
      verifyPayment(session_id, packageId)
    }
  }, [verifyingSession])

  const verifyPayment = async (sessionId: string, packageId: string | null) => {
    try {
      console.log('Verifying payment:', { sessionId, packageId })
      const response = await fetch(`/api/checkout/verify?session_id=${sessionId}&package=${packageId}`)
      const data = await response.json()

      console.log('Payment verification response:', data)

      if (data.success) {
        if (data.creditsAdded > 0) {
          setPaymentMessage(`Payment successful! ${data.creditsAdded} credits added!`)
          refreshCredits()
        } else {
          setPaymentMessage('Payment already processed')
        }
        // Clear URL parameters
        window.history.replaceState({}, document.title, '/create')
      } else {
        console.error('Payment verification failed:', data)
        setPaymentMessage(`Payment verification failed: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setPaymentMessage('Payment verification failed: Network error')
    }

    // Clear message after 5 seconds
    setTimeout(() => setPaymentMessage(''), 5000)
    // Clear verifying session after completion
    setTimeout(() => setVerifyingSession(null), 1000)
  }

  useEffect(() => {
    // Connect to Socket.IO server when component mounts
    socketService.connect()

    // Load user songs when user is available
    if (user) {
      loadUserSongs(user.uid).catch(console.error)
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [user])

  const handleSubmit = async () => {
    console.log('Submit button clicked, input:', input)
    console.log('Socket connected:', socketService.isConnected())
    
    if (!input.trim()) {
      console.error('Please enter a music prompt')
      return
    }

    try {
      // Check if prompt is valid, if not add to invalid prompts store
      if (!isValidPrompt(input, promptSource)) {
        console.error('Invalid prompt: does not contain "song"')
        addInvalidPrompt(input)
        setInput('') // Clear input after adding invalid prompt
        setPromptSource('manual') // Reset source
        return
      }

      // Check if user has enough credits
      if (credits < 50) {
        console.error('Insufficient credits')
        return
      }

      // Check if adding 2 more items would exceed the limit (more than 4 items = more than 2 songs)
      if (itemsInProgress + 2 > 4) {
        console.error('Server is busy. Cannot create new song.')
        setShowServerBusyWarning(true)
        return
      }

      // Deduct credits first
      await deductSongCredits()

      const random1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const random2 = Math.floor(Math.random() * 2000).toString().padStart(2, '0')
      
      const item1Id = `${Date.now()}${random1}`
      const item2Id = `${Date.now()}${random2}`
      
      // Generate random title for this song
      const songTitle = generateRandomTitle()
      
      // Generate random image number (1-4)
      const randomImageNumber = Math.floor(Math.random() * 4) + 1
      
      addMusicItem(songTitle, input, item1Id, 'v1', randomImageNumber, user?.uid)
      addMusicItem(songTitle, input, item2Id, 'v2', randomImageNumber, user?.uid)
      
      console.log('Sending API request...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002'}/create-song`, {
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
      setDisplayedText('')
      setPromptSource('manual') // Reset source
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleCreateSongClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handlePromptSelect = (prompt: string) => {
    setIsDropdownOpen(false)
    setPromptSource('create-song')
    startTypingAnimation(prompt)
  }

  const handleRandomClick = () => {
    const randomPrompt = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)]
    setPromptSource('random')
    startTypingAnimation(randomPrompt)
  }

  const startTypingAnimation = (fullText: string) => {
    setIsTypingAnimation(true)
    setDisplayedText('')
    
    let currentIndex = 0
    const typingSpeed = 30 // milliseconds per character
    
    const typeNextChar = () => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        currentIndex++
        setTimeout(typeNextChar, typingSpeed)
      } else {
        // Animation complete
        setIsTypingAnimation(false)
        setInput(fullText)
        setDisplayedText('')
        
        // Small delay to ensure input state is updated and button is enabled
        setTimeout(() => {
          // Force a re-render to ensure button state updates
        }, 100)
      }
    }
    
    typeNextChar()
  }

  // Pre-written lyrics sets
  const lyricsSets = [
    `Verse 1:
Walking down the empty streets at midnight
Moonlight dancing on the pavement
Every step echoes in the silence
I'm searching for something I can't name

Chorus:
Oh, this feeling deep inside my soul
Takes me places I've never been before
Lost in the moment, lost in the music
This is where I belong

Verse 2:
City lights are painting shadows tall
Neon signs are calling out my name
In this urban jungle, I find my way
Through the noise and through the pain`,

    `Verse 1:
Sunrise paints the sky in golden hues
Another day begins, fresh and new
Coffee steaming in my favorite mug
Time to face whatever comes my way

Chorus:
Every morning is a brand new start
A chance to heal, a chance to grow
Yesterday's gone, tomorrow's unknown
Today is all that really matters

Verse 2:
The world is waking up around me
Birds are singing their morning song
I take a deep breath and step outside
Ready for whatever life brings`,

    `Verse 1:
Raindrops tapping on my window pane
Watching storms from the comfort of my room
Each drop tells a story, whispers secrets
Nature's orchestra playing just for me

Chorus:
Let it rain, let it wash away the pain
Cleanse the soul, refresh the spirit
In the storm, I find my peace
In the chaos, I find my calm

Verse 2:
Thunder rolls across the darkened sky
Lightning flashes, briefly lighting the way
There's beauty in the storm's wild dance
A reminder of nature's power and grace`,

    `Verse 1:
Driving down the highway at sunset
Colors bleeding across the horizon
Radio playing my favorite song
Wind in my hair, freedom in my heart

Chorus:
This is the moment I've been waiting for
This is the feeling I've been searching for
Open road, open heart, open mind
Everything is possible right now

Verse 2:
Miles passing by like memories
Some I keep, some I let go
Every journey changes something in me
Every destination leads me home`,

    `Verse 1:
Staring up at the starry night sky
Counting constellations, making wishes
The universe feels so infinite
And I'm just a small part of it all

Chorus:
We're all made of stardust and dreams
Connected by invisible threads
Dancing through space and time together
Never truly alone in this cosmic dance

Verse 2:
The moon is watching over us all
A silent guardian in the dark
It's seen everything that ever was
And everything that ever will be`,

    `Verse 1:
Ocean waves crashing on the shore
Rhythmic, eternal, powerful and free
Salt air fills my lungs, clears my mind
Standing at the edge of the world

Chorus:
The ocean calls to something deep in me
A primal pull I can't explain
In its depths, I see my reflection
In its waves, I feel my emotions

Verse 2:
Seagulls crying overhead like messengers
Carrying secrets from far away lands
The tide comes in, the tide goes out
Like breathing, like living, like dying`,

    `Verse 1:
Empty room, silent walls
Echoes of conversations past
Furniture covered in white sheets
Like ghosts of memories sleeping

Chorus:
Sometimes the quiet speaks the loudest
Sometimes the emptiness feels full
In the spaces between the moments
That's where I find myself again

Verse 2:
Dust motes dancing in the sunlight
Each one a tiny universe
I watch them float and drift and settle
And remember how to just be still`,

    `Verse 1:
City subway, midnight train
Faces tired but eyes alive
Everyone going somewhere, coming from somewhere
Connected in this moving metal box

Chorus:
We're all just passengers on this journey
Trying to find our way back home
Some people stay, some people go
Everyone leaves a piece of themselves behind

Verse 2:
The train stops, doors slide open
New people board, others depart
Life is just a series of arrivals and goodbyes
And the journey continues in between`,

    `Verse 1:
Old bookstore, smell of paper and time
Shelves reaching up to the ceiling
Each book holds a different world
Waiting for someone to turn the page

Chorus:
Stories connect us across the ages
Words have power to heal or harm
In these pages, I find my escape
In these lines, I find my truth

Verse 2:
The shopkeeper knows every book by heart
Recommends treasures I'd never find alone
We talk about characters like old friends
And plots like dreams we've both had`,

    `Verse 1:
Mountain peak touching the clouds
World below looks small and far away
Wind whipping, cold air burning my lungs
But the view is worth every difficult step

Chorus:
Life is like climbing a mountain
The journey is hard but the destination is clear
Every setback teaches us something
Every summit shows us how far we've come

Verse 2:
The descent is always faster than the climb
But the memories stay with me forever
I carry this mountain in my heart now
And I know I can face any challenge`
  ];

  const handleLyricsGenerate = () => {
    setIsGeneratingLyrics(true)
    setLyrics('') // Clear existing lyrics
    
    // Simulate generation delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * lyricsSets.length);
      const selectedLyrics = lyricsSets[randomIndex];
      setLyrics(selectedLyrics);
      setIsGeneratingLyrics(false);
    }, 1500); // 1.5 second delay
  };

  // Handle manual input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isTypingAnimation) {
      setInput(e.target.value)
      setPromptSource('manual')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  return (
    <div className="flex flex-col items-center w-full relative">
      <div className="w-full max-w-[800px]">
        
        {/* Main prompt section */}
        <div className="flex flex-col items-center justify-center min-h-[590px] pt-[3.625rem]">
          <h1 className="text-white text-[32px] font-semibold text-center mb-6">
            {GPT_CONSTANTS.CREATE_PAGE.HEADING}
          </h1>
          
          {/* Input Section */}
          <div className="flex flex-col rounded-[2.5rem] bg-[#1D2125] w-full neon-glow-container">
            <div className="neon-content-wrapper flex flex-col">
              <div className="relative pt-5 px-5 min-h-[72px]">
              <motion.div
                animate={{
                  scale: isTypingAnimation ? 1.02 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
              >
                <textarea
                  value={isTypingAnimation ? displayedText : input}
                  onChange={handleInputChange}
                  placeholder=""
                  className={`w-full bg-transparent border-none focus:outline-none resize-none relative z-10 transition-all duration-200 ${
                    isTypingAnimation 
                      ? 'text-transparent bg-gradient-to-r from-transparent via-yellow-200 via-yellow-100 via-orange-300 to-purple-300 via-orange-300 via-yellow-100 via-yellow-200 to-transparent bg-clip-text' 
                      : 'text-white'
                  }`}
                  rows={1}
                  disabled={isTypingAnimation}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isTypingAnimation) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />
              </motion.div>
              {!input && !isTypingAnimation && (
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
              
              {/* Typing cursor */}
              {isTypingAnimation && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute top-5 left-5 bg-gradient-to-r from-transparent via-yellow-200 via-yellow-100 via-orange-300 to-purple-300 via-orange-300 via-yellow-100 via-yellow-200 to-transparent bg-clip-text text-transparent pointer-events-none"
                  style={{
                    left: `${5 + (displayedText.length * 8)}px`, // Approximate character width
                    top: '20px'
                  }}
                >
                  |
                </motion.span>
              )}
            </div>
            
            {/* Lyrics Section - Expandable */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isLyrics ? 'max-h-60 pb-3 opacity-100 border-t border-white/10' : 'max-h-0 pb-0 opacity-0'
              }`}
            >
              <div className="flex flex-row items-center gap-3 px-5 pt-3">
                {isGeneratingLyrics ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
                  </div>
                ) : (
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Add your lyrics"
                    className="flex-1 bg-transparent border-none text-white placeholder-white/30 focus:outline-none resize-none lyrics-scrollbar"
                    rows={5}
                  />
                )}
                <button className="flex flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1d21] border border-white/10 hover:bg-[rgb(58,62,66)] transition-all duration-200 active:scale-95 whitespace-nowrap" onClick={handleLyricsGenerate} disabled={isGeneratingLyrics}>
                  <Sparkles className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-sm font-semibold">Generate</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-row justify-between items-center px-5 pb-5 pt-3">
              <div className="flex flex-row gap-2">
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
                disabled={showServerBusyWarning || !input.trim()}
                className={`w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-200 group ${
                  showServerBusyWarning || !input.trim()
                    ? 'opacity-30 cursor-not-allowed' 
                    : 'hover:bg-white/90 hover:scale-110 active:scale-90'
                }`}
              >
                <ArrowRight className={`w-5 h-5 text-black ${!showServerBusyWarning && input.trim() && 'group-hover:animate-[wiggle_0.5s_ease-in-out_infinite]'}`} />
              </button>
            </div>
            </div>
          </div>

          {/* Payment Success Message */}
          {paymentMessage && (
            <div className="flex items-center gap-2 rounded-lg p-4 bg-[#6BFFAC]/[0.1] border border-[#6BFFAC]/[0.3] mt-4">
              <span className="text-[#6BFFAC] text-sm font-medium">{paymentMessage}</span>
            </div>
          )}

          {/* Action Buttons Section */}
          <div className="flex flex-row gap-2 mt-5 justify-start relative dropdown-container">
            {/* Create Song Dropdown */}
            <div className="relative">
              <RoundedButton 
                icon="/assets/svg/create-song.svg"
                alt="Create Song"
                text="Create Song"
                className="text-white/30"
                onClick={handleCreateSongClick}
              />
              
              {/* Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 w-80 bg-[#1D2125] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {promptSuggestions.map((prompt, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.1, delay: index * 0.02 }}
                          onClick={() => handlePromptSelect(prompt)}
                          className="px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors text-sm border-b border-white/5 last:border-b-0"
                        >
                          {prompt}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <RoundedButton 
              icon="/assets/svg/random.svg"
              alt="Random"
              text="Random"
              className="text-white/30"
              onClick={handleRandomClick}
            />
          </div>
        </div>

        {/* Music Items Display - Only show valid prompts */}
        {musicItems.filter((item) => isValidPrompt(item.prompt)).length > 0 && (
          <div className="flex flex-col gap-4 mt-8 pb-4">
            <h2 className="text-white text-xl font-semibold">{GPT_CONSTANTS.CREATE_PAGE.RECENT_GENERATIONS}</h2>
            {musicItems
              .filter((item) => isValidPrompt(item.prompt))
              .slice()
              .reverse()
              .map((item) => (
                <MusicList key={item.id} musicItem={item} />
              ))}
          </div>
        )}

        {/* Error Messages Container - Wrap warnings and invalid prompts with gap */}
        {(showServerBusyWarning || invalidPrompts.length > 0) && (
          <div className="flex flex-col gap-4 mt-4">
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
                    {GPT_CONSTANTS.ERROR_CONSTANTS.SERVER_BUSY.TITLE}
                  </span>
                </div>
                <div className="text-white/60 text-sm">
                  {GPT_CONSTANTS.ERROR_CONSTANTS.SERVER_BUSY.DESCRIPTION}{" "}
                  <span className="underline cursor-pointer hover:text-white transition-colors">
                    {GPT_CONSTANTS.ERROR_CONSTANTS.SERVER_BUSY.RETRY}
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
                    {GPT_CONSTANTS.ERROR_CONSTANTS.INVALID_PROMPT.TITLE}
                  </span>
                  <span className="text-white/30 text-sm">
                    {GPT_CONSTANTS.ERROR_CONSTANTS.INVALID_PROMPT.DESCRIPTION}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Music Player */}
      {currentTrack && (
        <MusicPlayer musicItem={currentTrack} isVisible={isPlayerVisible} />
      )}
    </div>
  )
}
