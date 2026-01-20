import { create } from 'zustand'

export interface LogEntry {
    id: string
    speaker: string
    text: string
    timestamp: number
}

interface ConversationState {
    logs: LogEntry[]
    addLog: (speaker: string, text: string) => void
    clearLogs: () => void
}

export const useConversationStore = create<ConversationState>((set) => ({
    logs: [],
    addLog: (speaker, text) => set((state) => ({
        logs: [
            {
                id: Math.random().toString(36).substr(2, 9),
                speaker,
                text,
                timestamp: Date.now()
            },
            ...state.logs
        ].slice(0, 50) // Keep last 50 logs
    })),
    clearLogs: () => set({ logs: [] })
}))
