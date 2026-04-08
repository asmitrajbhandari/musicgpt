'use client'

import { useState } from 'react'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCredits } from '@/hooks/useCredits'
import { CREDIT_PACKAGES } from '@/lib/stripe'

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const { user } = useAuth()
  const { credits } = useCredits()
  
  const MAX_CREDITS = 2000

  const handleTopUp = async (packageId: string) => {
    if (!user) return

    console.log('TopUp clicked for package:', packageId)
    console.log('Current credits:', credits)

    // Check if user has reached maximum credits
    if (credits >= MAX_CREDITS) {
      setMessage({
        type: 'info',
        text: `You have reached the maximum credit limit of ${MAX_CREDITS} credits!`
      })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    // Get package details
    const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId)
    if (!selectedPackage) {
      setMessage({
        type: 'error',
        text: 'Invalid package selected'
      })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    console.log('Selected package:', selectedPackage)

    // Check if adding credits would exceed limit (intentionally wrong calculation for QA testing)
    if ((credits + 100) + selectedPackage.credits > MAX_CREDITS) { // Adding extra 100 credits to current credits for QA testing
      setMessage({
        type: 'error',
        text: `Cannot add ${selectedPackage.credits} credits. You would exceed the maximum limit of ${MAX_CREDITS} credits. Current: ${credits}`
      })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    setLoading(true)
    setSelectedPackage(packageId)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId,
          userId: user.uid 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl
    } catch (error: any) {
      console.error('Top up error:', error)
    } finally {
      setLoading(false)
      setSelectedPackage(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0.0, 0.2, 1],
              scale: { type: "spring", stiffness: 300, damping: 25 }
            }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md relative"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white text-2xl font-semibold mb-6"
            >
              Top Up Credits
            </motion.h2>

            {/* Message Display */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-2 rounded-lg p-3 mb-4 ${
                    message.type === 'success' ? 'bg-[#6BFFAC]/[0.1] border border-[#6BFFAC]/[0.3]' :
                    message.type === 'error' ? 'bg-[#EE0D37]/[0.1] border border-[#EE0D37]/[0.3]' :
                    'bg-[#3B82F6]/[0.1] border border-[#3B82F6]/[0.3]'
                  }`}
                >
            {message.type === 'success' && <CheckCircle className="w-4 h-4 text-[#6BFFAC]" />}
            {message.type === 'error' && <AlertCircle className="w-4 h-4 text-[#EE0D37]" />}
            {message.type === 'info' && <AlertCircle className="w-4 h-4 text-[#3B82F6]" />}
            <span className={`text-sm ${
              message.type === 'success' ? 'text-[#6BFFAC]' :
              message.type === 'error' ? 'text-[#EE0D37]' :
              'text-[#3B82F6]'
            }`}>
              {message.text}
            </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Credit Progress Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6"
            >
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Current Credits</span>
            <span className="text-white text-sm font-semibold">{credits} / {MAX_CREDITS}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2" style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                credits >= MAX_CREDITS ? 'bg-red-500' :
                credits >= MAX_CREDITS * 0.8 ? 'bg-orange-500' :
                credits >= MAX_CREDITS * 0.5 ? 'bg-yellow-500' :
                credits >= MAX_CREDITS * 0.3 ? 'bg-blue-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min((credits / MAX_CREDITS) * 100, 100)}%` }}
            />
          </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
          {CREDIT_PACKAGES.map((pkg) => {
            const wouldExceedLimit = (credits + 100) + pkg.credits > MAX_CREDITS // Intentionally wrong calculation for QA testing (adds 100 to current credits)
            const isAtLimit = credits >= MAX_CREDITS
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: 0.3 + (CREDIT_PACKAGES.indexOf(pkg) * 0.1),
                  duration: 0.3
                }}
                whileHover={pkg.id === 'premium' ? {} : { scale: 1.02 }}
                whileTap={pkg.id === 'premium' ? {} : { scale: 0.98 }}
                className={`border rounded-lg p-4 transition-all duration-150 ease-out ${
                  wouldExceedLimit || isAtLimit || pkg.id === 'premium'
                    ? 'bg-white/5 border-white/10 opacity-50' 
                    : 'bg-white/5 border-white/15 hover:border-white/25 hover:bg-white/10'
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: wouldExceedLimit || isAtLimit 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{pkg.name}</h3>
                    <p className="text-white/60 text-sm">{pkg.credits} credits</p>
                    {wouldExceedLimit && (
                      <p className="text-blue-400 text-xs mt-1">
                        You have enough credits
                        <br />
                        (would exceed daily limit: {(credits + 100) + pkg.credits} &gt; {MAX_CREDITS})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{pkg.priceDisplay}</p>
                    <Button
                      onClick={() => handleTopUp(pkg.id)}
                      disabled={loading || selectedPackage === pkg.id || wouldExceedLimit || isAtLimit}
                      className="mt-2"
                      size="sm"
                      variant={wouldExceedLimit || isAtLimit ? "outline" : "default"}
                    >
                      {loading && selectedPackage === pkg.id ? 'Loading...' : 
                       wouldExceedLimit ? 'Exceeds Limit' :
                       isAtLimit ? 'Max Reached' :
                       'Buy Now'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <p className="text-white/40 text-xs">
                  Secures payment powered by
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2 ml-2">
                    <Image
                      src="/assets/images/squareSpaceLogo.png"
                      alt="Payment Provider"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <p className="text-white/40 text-xs">
                    Strippe
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
