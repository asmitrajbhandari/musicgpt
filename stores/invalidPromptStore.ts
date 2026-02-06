import { create } from 'zustand'

interface InvalidPromptStore {
  invalidPrompts: string[]
  addInvalidPrompt: (prompt: string) => void
  clearInvalidPrompts: () => void
}

export const useInvalidPromptStore = create<InvalidPromptStore>((set) => ({
  invalidPrompts: [],
  addInvalidPrompt: (prompt: string) => 
    set((state) => {
      // Only add if not already in the list (avoid duplicates)
      if (!state.invalidPrompts.includes(prompt)) {
        return { invalidPrompts: [...state.invalidPrompts, prompt] }
      }
      return state
    }),
  clearInvalidPrompts: () => set({ invalidPrompts: [] }),
}))
