import { create } from 'zustand'

interface WarningStore {
  showServerBusyWarning: boolean
  setShowServerBusyWarning: (show: boolean) => void
}

export const useWarningStore = create<WarningStore>((set) => ({
  showServerBusyWarning: false,
  setShowServerBusyWarning: (show: boolean) => set({ showServerBusyWarning: show }),
}))
