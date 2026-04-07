'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user')
      setUser(user)
      setLoading(false)
      
      // Initialize credits for new users
      if (user) {
        const { initializeUserCredits } = require('@/lib/firebase')
        initializeUserCredits(user.uid).catch(console.error)
      }
    }, (error) => {
      console.error('Auth state change error:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    const { signInWithEmail } = await import('@/lib/firebase')
    await signInWithEmail(email, password)
  }

  const signUp = async (email: string, password: string) => {
    const { signUpWithEmail } = await import('@/lib/firebase')
    await signUpWithEmail(email, password)
  }

  const signInWithGoogle = async () => {
    const { signInWithGoogle: googleSignIn } = await import('@/lib/firebase')
    await googleSignIn()
  }

  const signOut = async () => {
    const { signOut: firebaseSignOut } = await import('@/lib/firebase')
    await firebaseSignOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
