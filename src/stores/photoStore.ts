import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Photo {
    id: string
    timestamp: number
    dataUrl: string // base64 image data
    filter: string
}

interface PhotoState {
    photos: Photo[]
    addPhoto: (dataUrl: string, filter: string) => void
    deletePhoto: (id: string) => void
    clearAll: () => void
}

export const usePhotoStore = create<PhotoState>()(
    persist(
        (set) => ({
            photos: [],
            addPhoto: (dataUrl, filter) => set((state) => ({
                photos: [{
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    dataUrl,
                    filter
                }, ...state.photos]
            })),
            deletePhoto: (id) => set((state) => ({
                photos: state.photos.filter(p => p.id !== id)
            })),
            clearAll: () => set({ photos: [] })
        }),
        {
            name: 'photo-gallery',
        }
    )
)
