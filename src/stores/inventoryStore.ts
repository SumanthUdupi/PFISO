import { create } from 'zustand'

interface InventoryState {
    items: string[]
    addItem: (id: string) => void
    removeItem: (id: string) => void
    hasItem: (id: string) => boolean
}

const useInventoryStore = create<InventoryState>((set, get) => ({
    items: [],
    addItem: (id) => set((state) => {
        if (state.items.includes(id)) return state
        return { items: [...state.items, id] }
    }),
    removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i !== id)
    })),
    hasItem: (id) => get().items.includes(id)
}))

export default useInventoryStore
