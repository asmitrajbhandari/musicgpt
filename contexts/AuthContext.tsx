'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useUserStore } from '@/stores/userStore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: () => Promise<void>
  updateUserDisplayName: (displayName: string) => void
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { userProfile, fetchUserProfile, updateUserProfile: updateStoreProfile, clearUserProfile } = useUserStore()

  const refreshUserProfile = async () => {
    if (user) {
      try {
        console.log('AuthContext: Refreshing user profile for userId:', user.uid);
        await fetchUserProfile(user.uid);
        console.log('AuthContext: User profile refreshed from Zustand store');
      } catch (error) {
        console.error('AuthContext: Failed to refresh user profile:', error);
      }
    } else {
      console.log('AuthContext: No user found, cannot refresh profile');
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      
      if (user) {
        console.log('AuthContext: User logged in, fetching profile from backend');
        // Fetch user profile from backend when user logs in
        refreshUserProfile();
        
        // Initialize credits for new users
        const { initializeUserCredits } = require('@/lib/firebase')
        initializeUserCredits(user.uid).catch(console.error)
      } else {
        clearUserProfile();
      }
      
      setLoading(false)
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

  const updateUserProfile = async () => {
    // Force refresh the user object to get updated profile
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await currentUser.reload();
        console.log('User profile reloaded from Firebase Auth');
        
        // Create a new user object to trigger re-render
        const refreshedUser = { ...currentUser };
        
        // Force state update even if object reference is the same
        setUser(refreshedUser);
        
        // Additional force update by setting to null then back to user
        setTimeout(() => {
          setUser(null);
          setTimeout(() => {
            setUser(refreshedUser);
            console.log('User state force updated:', refreshedUser.displayName);
          }, 50);
        }, 100);
        
      } catch (error) {
        console.error('Failed to reload user profile:', error);
        // Fallback: create updated user object manually
        const updatedUser = { 
          ...currentUser, 
          displayName: currentUser.displayName 
        };
        setUser(updatedUser);
      }
    }
  }

  const updateUserDisplayName = (displayName: string) => {
    // Directly update the user state with new display name
    if (user) {
      const updatedUser = { ...user, displayName };
      setUser(updatedUser);
      console.log('AuthContext: User display name updated locally:', displayName);
      
      // Also update Zustand store
      if (userProfile) {
        const updatedProfile = { ...userProfile, displayName };
        useUserStore.setState({ userProfile: updatedProfile });
        console.log('AuthContext: User profile state updated in Zustand:', displayName);
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateUserProfile,
      updateUserDisplayName,
      refreshUserProfile
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
