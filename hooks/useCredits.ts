'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserCredits, deductCredits, addCredits, initializeUserCredits } from '@/lib/firebase'

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (user) {
      loadCredits()
    } else {
      setCredits(0)
      setLoading(false)
    }
  }, [user])

  const loadCredits = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userCredits = await getUserCredits(user.uid)
      setCredits(userCredits)
    } catch (error) {
      console.error('Error loading credits:', error)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  const deductSongCredits = async () => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const newCredits = await deductCredits(user.uid, 50)
      setCredits(newCredits)
      return newCredits
    } catch (error) {
      console.error('Error deducting credits:', error)
      throw error
    }
  }

  const topUpCredits = async (amount: number) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const newCredits = await addCredits(user.uid, amount)
      setCredits(newCredits)
      return newCredits
    } catch (error) {
      console.error('Error adding credits:', error)
      throw error
    }
  }

  const initializeCredits = async () => {
    if (!user) return
    
    try {
      await initializeUserCredits(user.uid)
      await loadCredits()
    } catch (error) {
      console.error('Error initializing credits:', error)
    }
  }

  return {
    credits,
    loading,
    deductSongCredits,
    topUpCredits,
    initializeCredits,
    refreshCredits: loadCredits
  }
}
