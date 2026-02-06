import { create } from 'zustand'

export interface MusicItem {
  id: string
  title: string
  prompt: string
  status: 'idle' | 'pending' | 'generating' | 'completed' | 'failed'
  progress: number
  progressText?: string
  result?: any
  error?: string
  version: string
  imageNumber: number
}

export interface MusicStoreState {
  musicItems: MusicItem[]
}

export interface MusicStoreActions {
  addMusicItem: (title: string, prompt: string, id?: string, version?: string, imageNumber?: number) => void
  updateMusicItem: (id: string, updates: Partial<MusicItem>) => void
  removeMusicItem: (id: string) => void
  reset: () => void
}

export const useSongStore = create<MusicStoreState & MusicStoreActions>((set, get) => ({
  musicItems: [],
  
  addMusicItem: (title: string, prompt: string, id?: string, version?: string, imageNumber?: number) => {
    const newItem: MusicItem = {
      id: id || `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      title,
      prompt,
      status: 'pending',
      progress: 0,
      version: version || 'v1',
      imageNumber: imageNumber || 1
    }
    set({ musicItems: [...get().musicItems, newItem] })
  },
  
  updateMusicItem: (id: string, updates: Partial<MusicItem>) => {
    set((state) => ({
      musicItems: state.musicItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  },
  
  removeMusicItem: (id: string) => {
    set((state) => ({
      musicItems: state.musicItems.filter(item => item.id !== id)
    }))
  },
  
  reset: () => set({ musicItems: [] }),
}))
