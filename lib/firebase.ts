import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, signInWithPopup, updateProfile as firebaseUpdateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDV4VYcUS6FIBaNoNYk8uqi03pAkKfCtRQ",
  authDomain: "music-edc12.firebaseapp.com",
  projectId: "music-edc12",
  storageBucket: "music-edc12.firebasestorage.app",
  messagingSenderId: "761089825359",
  appId: "1:761089825359:web:797c03caf78970b262a83a",
  measurementId: "G-YGEJ5K897S"
}

let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw error
}

// Initialize analytics only on client side
let analytics = null
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app!)
  }).catch(console.error)
}

export const auth = getAuth(app!)
export const db = getFirestore(app!)
export const storage = getStorage(app!)
export const googleProvider = new GoogleAuthProvider()

// Credit management functions
export const initializeUserCredits = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userDocRef)
  
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      credits: 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }
}

export const getUserCredits = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userDocRef)
  
  if (userDoc.exists()) {
    return userDoc.data().credits || 0
  }
  
  // Initialize with default credits if user doesn't exist
  await initializeUserCredits(userId)
  return 50
}

export const deductCredits = async (userId: string, amount: number) => {
  const userDocRef = doc(db, 'users', userId)
  const currentCredits = await getUserCredits(userId)
  
  if (currentCredits < amount) {
    throw new Error('Insufficient credits')
  }
  
  await updateDoc(userDocRef, {
    credits: currentCredits - amount,
    updatedAt: serverTimestamp()
  })
  
  return currentCredits - amount
}

export const addCredits = async (userId: string, amount: number) => {
  const userDocRef = doc(db, 'users', userId)
  const currentCredits = await getUserCredits(userId)
  
  await updateDoc(userDocRef, {
    credits: currentCredits + amount,
    updatedAt: serverTimestamp()
  })
  
  return currentCredits + amount
}

export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const signUpWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password)
}

export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider)
}

export const signOut = async () => {
  return await firebaseSignOut(auth)
}

// Profile management functions
export const updateUserProfile = async (userId: string, displayName: string, photoURL?: string) => {
  const userDocRef = doc(db, 'users', userId)
  
  // Update Firestore user document
  await updateDoc(userDocRef, {
    displayName,
    photoURL,
    updatedAt: serverTimestamp()
  })
  
  // Update Firebase Auth profile if user is authenticated
  const currentUser = auth.currentUser
  if (currentUser && currentUser.uid === userId) {
    await firebaseUpdateProfile(currentUser, {
      displayName,
      photoURL: photoURL || null
    })
  }
}

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `profile-pictures/${userId}`)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

export const getUserProfile = async (userId: string) => {
  const userDocRef = doc(db, 'users', userId)
  const userDoc = await getDoc(userDocRef)
  
  if (userDoc.exists()) {
    return userDoc.data()
  }
  
  return null
}

// Song management functions
export const saveUserSong = async (userId: string, songData: any) => {
  const songDocRef = doc(db, 'users', userId, 'songs', songData.id)
  await setDoc(songDocRef, {
    ...songData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export const getUserSongs = async (userId: string) => {
  const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore')
  const db = getFirestore()
  
  const songsQuery = query(
    collection(db, 'users', userId, 'songs'),
    where('userId', '==', userId)
  )
  
  const querySnapshot = await getDocs(songsQuery)
  const songs: any[] = []
  
  querySnapshot.forEach((doc) => {
    songs.push({ id: doc.id, ...doc.data() })
  })
  
  return songs
}

export const updateUserSong = async (userId: string, songId: string, songData: any) => {
  const songDocRef = doc(db, 'users', userId, 'songs', songId)
  await updateDoc(songDocRef, {
    ...songData,
    updatedAt: serverTimestamp()
  })
}
