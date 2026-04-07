// Random song list for playback when generation is complete
export const RANDOM_SONGS = [
  'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/Turn_On_The_Lights_Remix_FULL_SONG_MusicGPT_5840d1f1-0db5-4208-b644-048afa692d4e.mp3',
  'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/Stromae_-_Papaoutai__Afro_Soul_Cover_Tiktok_version_93a3f866-c606-4b31-b971-67900a6c9322.mp3',
  'https://cdn1.musicgpt.com/conversions/standard/d44f874d-34b5-4804-9a9c-e1b4f266bc17/master.m3u8',
  'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/f600961e-e3bb-4ceb-9f42-ab2796b17007_STILL_BREATHING_BARELY_b266a155-0dc2-43e7-9d69-019f5b493f81.mp3',
  'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/RIGHT_WHERE_YOU_LEFT_ME_FULL_SONG_MusicGPT_180fe40c-bff7-4f76-a3eb-2b875bf07736.mp3',
  'https://musicgpt.s3.us-east-1.amazonaws.com/audio-media-assets/WHEN_YOU_TURNED_AWAY_FULL_SONG_MusicGPT_778ce1bf-66a5-40b9-990d-f1d2cfa038e2.mp3'
]

export function getRandomSong(): string {
  const randomIndex = Math.floor(Math.random() * RANDOM_SONGS.length)
  return RANDOM_SONGS[randomIndex]
}
