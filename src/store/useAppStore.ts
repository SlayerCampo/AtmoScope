import { create } from 'zustand'

interface AppState {
  selectedYear: number
  activeRegion: string | null
  eventFilter: string
  setSelectedYear: (year: number) => void
  setActiveRegion: (region: string | null) => void
  setEventFilter: (filter: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedYear: 2024,
  activeRegion: null,
  eventFilter: 'ALL',
  setSelectedYear: (year) => set({ selectedYear: year }),
  setActiveRegion: (region) => set({ activeRegion: region }),
  setEventFilter: (filter) => set({ eventFilter: filter }),
}))
