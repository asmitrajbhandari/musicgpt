import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDV4VYcUS6FIBaNoNYk8uqi03pAkKfCtRQ",
  authDomain: "music-edc12.firebaseapp.com",
  projectId: "music-edc12",
  storageBucket: "music-edc12.firebasestorage.app",
  messagingSenderId: "761089825359",
  appId: "1:761089825359:web:797c03caf78970b262a83a",
  measurementId: "G-YGEJ5K897S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Get user document from Firestore
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({ 
      success: true, 
      user: {
        uid: userId,
        displayName: userData.displayName || null,
        email: userData.email || null,
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
