import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
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
const auth = getAuth(app);

export async function PUT(request: NextRequest) {
  try {
    const { userId, displayName, photoURL } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Update Firestore user document
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      displayName,
      photoURL: photoURL || null,
      updatedAt: serverTimestamp()
    });

    // Update Firebase Auth profile
    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        await firebaseUpdateProfile(currentUser, {
          displayName: displayName || null,
          photoURL: photoURL || null
        });
        console.log('Firebase Auth profile updated successfully');
      }
    } catch (authError) {
      console.error('Failed to update Firebase Auth profile:', authError);
      // Don't fail the whole operation if Auth update fails
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
