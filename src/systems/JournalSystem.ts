import { create } from 'zustand'

export interface JournalEntry {
    id: string
    title: string
    description: string
    unlocked: boolean
    timestamp: number
}

export interface JournalState {
    entries: JournalEntry[]
    unlockEntry: (id: string, title: string, description: string) => void
    hasEntry: (id: string) => boolean
}

const useJournalStore = create<JournalState>((set, get) => ({
    entries: [],
    unlockEntry: (id, title, description) => {
        if (get().hasEntry(id)) return

        set(state => ({
            entries: [...state.entries, {
                id,
                title,
                description,
                unlocked: true,
                timestamp: Date.now()
            }]
        }))
        console.log(`[Journal] Unlocked: ${title}`)
    },
    hasEntry: (id) => get().entries.some(e => e.id === id)
}))

export default useJournalStore
