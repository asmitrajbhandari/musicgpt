import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUserProfileFromBackend, updateUserProfileInBackend, uploadProfilePictureToBackend } from '@/lib/userApi'

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt?: any;
  updatedAt?: any;
}

interface UserStore {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (userId: string, displayName: string, photoURL?: string) => Promise<void>;
  uploadProfilePicture: (userId: string, file: File) => Promise<string>;
  clearUserProfile: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userProfile: null,
      loading: false,
      error: null,

      fetchUserProfile: async (userId: string) => {
        set({ loading: true, error: null })
        
        try {
          const profile = await getUserProfileFromBackend(userId);
          set({ userProfile: profile, loading: false });
        } catch (error) {
          console.error('UserStore: Failed to fetch user profile:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to fetch user profile', loading: false });
        }
      },

      updateUserProfile: async (userId: string, displayName: string, photoURL?: string) => {
        set({ loading: true, error: null })
        
        try {
          const result = await updateUserProfileInBackend(userId, displayName, photoURL);
          
          // Update local state with the response from backend
          set({ userProfile: result.user, loading: false });
        } catch (error) {
          console.error('UserStore: Failed to update user profile:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to update user profile', loading: false });
        }
      },

      uploadProfilePicture: async (userId: string, file: File) => {
        set({ loading: true, error: null })
        
        try {
          const photoURL = await uploadProfilePictureToBackend(userId, file);
          
          // Update local state with new photo URL
          const currentState = get().userProfile;
          if (currentState) {
            set({ 
              userProfile: { ...currentState, photoURL }, 
              loading: false 
            });
          } else {
            set({ loading: false });
          }
          
          return photoURL;
        } catch (error) {
          console.error('UserStore: Failed to upload profile picture:', error);
          set({ error: error instanceof Error ? error.message : 'Failed to upload profile picture', loading: false });
          throw error;
        }
      },

      clearUserProfile: () => {
        set({ userProfile: null, error: null });
      }
    }),
    {
      name: 'user-profile-storage',
      partialize: (state) => ({ userProfile: state.userProfile })
    }
  )
)
