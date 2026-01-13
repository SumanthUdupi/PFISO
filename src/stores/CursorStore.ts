import { create } from 'zustand'

export type CursorType = 'default' | 'pointer' | 'grab' | 'text' | 'crosshair'

interface CursorState {
    cursor: CursorType
    setCursor: (cursor: CursorType) => void
}

const useCursorStore = create<CursorState>((set) => ({
    cursor: 'default',
    setCursor: (cursor) => {
        // Apply to body immediately for responsiveness
        document.body.style.cursor = cursor
        set({ cursor })
    }
}))

export default useCursorStore
