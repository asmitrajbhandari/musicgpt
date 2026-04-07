import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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

export async function POST(request: NextRequest) {
  try {
    const { userId, songData, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    if (action === 'save') {
      // Save new song
      const songDocRef = doc(db, 'users', userId, 'songs', songData.id);
      await setDoc(songDocRef, {
        ...songData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return NextResponse.json({ success: true, message: 'Song saved successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error saving song:', error);
    return NextResponse.json({ success: false, error: 'Failed to save song' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, songId, updates } = await request.json();

    if (!userId || !songId) {
      return NextResponse.json({ success: false, error: 'User ID and Song ID required' }, { status: 400 });
    }

    // Update song
    const songDocRef = doc(db, 'users', userId, 'songs', songId);
    await updateDoc(songDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({ success: true, message: 'Song updated successfully' });

  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json({ success: false, error: 'Failed to update song' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Get all songs for user
    const songsCollection = await getDocs(collection(db, 'users', userId, 'songs'));
    const songs: any[] = [];
    
    songsCollection.forEach((doc: any) => {
      songs.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ success: true, songs });

  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch songs' }, { status: 500 });
  }
}
