import { create } from 'zustand'

interface AppState {
  selectedYear: number
  activeRegion: string | null
  eventFilter: string
  currentPlanet: string
  viewMode: '3D' | '2D'
  selectedRegionData: any
  setSelectedYear: (year: number) => void
  setActiveRegion: (region: string | null) => void
  setEventFilter: (filter: string) => void
  setCurrentPlanet: (planet: string) => void
  setViewMode: (mode: '3D' | '2D') => void
  setSelectedRegionData: (data: any) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedYear: 2024,
  activeRegion: null,
  eventFilter: 'ALL',
  currentPlanet: 'Earth',
  viewMode: '3D',
  selectedRegionData: null,
  setSelectedYear: (year) => set({ selectedYear: year }),
  setActiveRegion: (region) => set({ activeRegion: region }),
  setEventFilter: (filter) => set({ eventFilter: filter }),
  setCurrentPlanet: (planet) => set({ currentPlanet: planet }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedRegionData: (data) => set({ selectedRegionData: data }),
}))
