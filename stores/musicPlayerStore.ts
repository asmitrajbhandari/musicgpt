import { create } from 'zustand'

interface MusicPlayerState {
  isVisible: boolean
  currentTrack: {
    id: string
    title: string
    imageNumber: number
  } | null
  showPlayer: (track: { id: string; title: string; imageNumber: number }) => void
  hidePlayer: () => void
}

export const useMusicPlayerStore = create<MusicPlayerState>((set) => ({
  isVisible: false,
  currentTrack: null,
  showPlayer: (track) => set({ isVisible: true, currentTrack: track }),
  hidePlayer: () => set({ isVisible: false, currentTrack: null }),
}))
