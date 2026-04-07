import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveSongToBackend, updateSongInBackend, getSongsFromBackend } from '@/lib/songApi'

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
  userId?: string
  completedAt?: number
  hasBeenPlayed?: boolean
  liked?: boolean
  disliked?: boolean
  downloaded?: boolean
}

export interface MusicStoreState {
  musicItems: MusicItem[]
}

export interface MusicStoreActions {
  addMusicItem: (title: string, prompt: string, id?: string, version?: string, imageNumber?: number, userId?: string) => void
  updateMusicItem: (id: string, updates: Partial<MusicItem>) => void
  removeMusicItem: (id: string) => void
  reset: () => void
  loadUserSongs: (userId: string) => Promise<void>
}

export const useSongStore = create<MusicStoreState & MusicStoreActions>()(
  persist(
    (set, get) => ({
      musicItems: [],
      
      addMusicItem: (title: string, prompt: string, id?: string, version?: string, imageNumber?: number, userId?: string) => {
        const newItem: MusicItem = {
          id: id || `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          title,
          prompt,
          status: 'pending',
          progress: 0,
          version: version || 'v1',
          imageNumber: imageNumber || 1,
          userId
        }
        set({ musicItems: [...get().musicItems, newItem] })
        
        // Save to backend if userId is provided
        if (userId) {
          saveSongToBackend(userId, newItem).catch(console.error)
        }
      },
      
      updateMusicItem: (id: string, updates: Partial<MusicItem>) => {
        set((state) => ({
          musicItems: state.musicItems.map(item => 
            item.id === id ? { ...item, ...updates } : item
          )
        }))
        
        // Update in backend if item has userId
        const item = get().musicItems.find(item => item.id === id)
        if (item?.userId) {
          updateSongInBackend(item.userId, id, updates).catch(console.error)
        }
      },
      
      removeMusicItem: (id: string) => {
        set((state) => ({
          musicItems: state.musicItems.filter(item => item.id !== id)
        }))
      },
      
      reset: () => set({ musicItems: [] }),
      
      loadUserSongs: async (userId: string) => {
        try {
          const userSongs = await getSongsFromBackend(userId)
          set({ musicItems: userSongs })
        } catch (error) {
          console.error('Failed to load user songs:', error)
        }
      },
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({ musicItems: state.musicItems })
    }
  )
)
