// Song mapping configuration for random songs
export interface SongMapping {
  id: string
  title: string
  artist: string
  url: string
  duration?: string
}

export const SONG_MAPPING: Record<string, SongMapping> = {
  song_1: {
    id: 'song_1',
    title: 'Turn On The Lights Remix',
    artist: 'MusicGPT',
    url: 'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/Turn_On_The_Lights_Remix_FULL_SONG_MusicGPT_5840d1f1-0db5-4208-b644-048afa692d4e.mp3',
    duration: '3:24'
  },
  song_2: {
    id: 'song_2',
    title: 'Papaoutai Afro Soul Cover',
    artist: 'Stromae',
    url: 'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/Stromae_-_Papaoutai__Afro_Soul_Cover_Tiktok_version_93a3f866-c606-4b31-b971-67900a6c9322.mp3',
    duration: '2:15'
  },
  song_3: {
    id: 'song_3',
    title: 'Standard Conversion',
    artist: 'MusicGPT',
    url: 'https://cdn1.musicgpt.com/conversions/standard/d44f874d-34b5-4804-9a9c-e1b4f266bc17/master.m3u8',
    duration: '4:12'
  },
  song_4: {
    id: 'song_4',
    title: 'Still Breathing Barely',
    artist: 'MusicGPT',
    url: 'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/f600961e-e3bb-4ceb-9f42-ab2796b17007_STILL_BREATHING_BARELY_b266a155-0dc2-43e7-9d69-019f5b493f81.mp3',
    duration: '3:48'
  },
  song_5: {
    id: 'song_5',
    title: 'Right Where You Left Me',
    artist: 'MusicGPT',
    url: 'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/RIGHT_WHERE_YOU_LEFT_ME_FULL_SONG_MusicGPT_180fe40c-bff7-4f76-a3eb-2b875bf07736.mp3',
    duration: '3:56'
  },
  song_6: {
    id: 'song_6',
    title: 'When You Turned Away',
    artist: 'MusicGPT',
    url: 'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/WHEN_YOU_TURNED_AWAY_FULL_SONG_MusicGPT_778ce1bf-66a5-40b9-990d-f1d2cfa038e2.mp3',
    duration: '4:03'
  }
}

export const SONG_KEYS = Object.keys(SONG_MAPPING)

// Function to get consistent song key based on song ID
export function getSongKeyForId(songId: string): string {
  const hash = songId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = Math.abs(hash) % SONG_KEYS.length
  return SONG_KEYS[index]
}

// Function to get song mapping by key
export function getSongMapping(songKey: string): SongMapping | null {
  return SONG_MAPPING[songKey] || null
}
