import { create } from 'zustand'

interface Photo {
    id: string
    dataUrl: string
    timestamp: number
    filter?: string
}

interface PhotographyState {
    isPhotographyMode: boolean
    photos: Photo[]
    currentFilter: string
    setPhotographyMode: (enabled: boolean) => void
    capturePhoto: (dataUrl: string) => void
    setFilter: (filter: string) => void
    deletePhoto: (id: string) => void
    clearPhotos: () => void
}

const usePhotographyStore = create<PhotographyState>((set, get) => ({
    isPhotographyMode: false,
    photos: [],
    currentFilter: 'none',
    setPhotographyMode: (enabled) => set({ isPhotographyMode: enabled }),
    capturePhoto: (dataUrl) => set((state) => ({
        photos: [...state.photos, {
            id: Date.now().toString(),
            dataUrl,
            timestamp: Date.now(),
            filter: state.currentFilter
        }]
    })),
    setFilter: (filter) => set({ currentFilter: filter }),
    deletePhoto: (id) => set((state) => ({
        photos: state.photos.filter(p => p.id !== id)
    })),
    clearPhotos: () => set({ photos: [] })
}))

export default usePhotographyStore