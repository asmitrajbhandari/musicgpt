'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ProgressBar Component
 * 
 * Displays a thin animated progress bar at the top of the page during navigation.
 * Automatically triggers when the route changes and provides visual feedback
 * to users during page transitions.
 * 
 * 
 * @since 1.0.0
 */

export default function ProgressBar() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
      setProgress(0)
      
      // Simulate smooth progress from 0% to 100%
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 10)

      // Hide the progress bar after completion
      setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 900)
    }

    // Trigger progress when pathname changes
    handleStart()
  }, [pathname])

  return (
    <div 
      className={`fixed top-0 left-0 right-0 w-screen h-[2px] bg-gray-200/20 z-[9999] transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className="h-full bg-gradient-to-r from-orange-600 to-purple-800 to-yellow-800 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
