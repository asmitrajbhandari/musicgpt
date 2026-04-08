import { io, Socket } from 'socket.io-client'
import { useSongStore } from '@/stores/songStore'
import { updateSongInBackend } from '@/lib/songApi'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    if (this.socket?.connected) {
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 5000,
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      // Handle disconnect
    })

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error.message)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })

    this.socket.on('song-progress', (data: { id: string; progress: number; status: string; prompt: string }) => {
      
      let progressText = ''
      if (data.progress >= 0 && data.progress <= 20) {
        progressText = 'Starting AI and v engine.'
      } else if (data.progress >= 21 && data.progress <= 40) {
        progressText = 'Initializing sound'
      } else if (data.progress >= 41 && data.progress <= 60) {
        progressText = 'Initializing sound model'
      } else if (data.progress >= 61 && data.progress <= 80) {
        progressText = 'Finalizing high quality sound'
      } else if (data.progress >= 81 && data.progress <= 99) {
        progressText = 'Finishing up'
      } else if (data.progress === 100) {
        progressText = 'Complete'
      }
      
      if (data.id) {
        const store = useSongStore.getState()
        const musicItem = store.musicItems.find(item => item.id === data.id)
        
        if (musicItem) {
          // Don't overwrite completed songs with old progress data
          // Check for various completion states
          const isAlreadyCompleted = 
            musicItem.status === 'completed' || 
            (musicItem.progress === 100 && musicItem.status !== 'failed') ||
            (musicItem.result && musicItem.result.url);
          
          if (isAlreadyCompleted) {
            return
          }
          
          const updates: any = {
            progress: data.progress || 0,
            status: (data.status as 'idle' | 'pending' | 'generating' | 'completed' | 'failed') || 'generating',
            progressText
          }
          
          // Set completedAt timestamp when song completes
          if (data.progress === 100 && data.status === 'completed') {
            updates.completedAt = Date.now()
            
            // Save the completed status to Firebase when song finishes
            if (musicItem.userId) {
              updateSongInBackend(musicItem.userId!, data.id, {
                status: 'completed',
                progress: 100,
                completedAt: Date.now()
              }).catch(error => {
                console.error('Failed to save completed status to Firebase:', error);
              });
            }
          }
          
          store.updateMusicItem(data.id, updates)
        } else {
          console.warn('Music item not found for ID:', data.id)
        }
      } else {
        console.warn('No ID in progress data:', data)
      }
    })

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error)
    })
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, attempting to connect...')
      this.connect()
      
      setTimeout(() => {
        this.emit(event, data)
      }, 1000)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

export const socketService = new SocketService()
