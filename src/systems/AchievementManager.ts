import { create } from 'zustand'
import useGameStore from '../store'

export interface Achievement {
    id: string
    title: string
    description: string
    icon?: string
    unlocked: boolean
    hidden?: boolean
}

const AUTHORIZED_ACHIEVEMENTS: Achievement[] = [
    { id: 'FIRST_STEP', title: 'First Steps', description: 'Take your first step into the world.', unlocked: false },
    { id: 'COLLECTOR', title: 'Collector', description: 'Find your first inspiration mote.', unlocked: false },
    { id: 'EXPLORER', title: 'Explorer', description: 'Discover a hidden area.', unlocked: false, hidden: true },
    { id: 'SPEED_DEMON', title: 'Speed Demon', description: 'Dash for 5 seconds continuously.', unlocked: false }, // Example
    { id: "SYS_016_TEST", title: "Achievement Hunter", description: "Unlock an achievement.", unlocked: false }
]

interface AchievementState {
    achievements: Achievement[]
    queue: Achievement[] // Queue for displaying toasts
    unlock: (id: string) => void
    popToast: () => void
    reset: () => void
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
    achievements: AUTHORIZED_ACHIEVEMENTS,
    queue: [],

    unlock: (id: string) => {
        const { achievements, queue } = get()
        const index = achievements.findIndex(a => a.id === id)

        if (index !== -1 && !achievements[index].unlocked) {
            const newAchievements = [...achievements]
            newAchievements[index] = { ...newAchievements[index], unlocked: true }

            // Add to Toast Queue
            const newQueue = [...queue, newAchievements[index]]

            set({ achievements: newAchievements, queue: newQueue })

            // Persist (Wait for main store or just save purely local here?)
            // We'll update main game store if we want it unified, but often achievements are global.
            // For now, let's assume we might want to sync this to GameStore later or simplify.
            // Let's rely on standard localStorage for achievements separately or integrate.
            localStorage.setItem('sys_achievements', JSON.stringify(newAchievements.map(a => a.id).filter(id => {
                const ac = newAchievements.find(n => n.id === id)
                return ac?.unlocked
            })))
        }
    },

    popToast: () => {
        set(state => ({ queue: state.queue.slice(1) }))
    },

    reset: () => {
        set({ achievements: AUTHORIZED_ACHIEVEMENTS, queue: [] })
        localStorage.removeItem('sys_achievements')
    }
}))

// Load initial state
if (typeof window !== 'undefined') {
    try {
        const saved = localStorage.getItem('sys_achievements')
        if (saved) {
            const unlockedIds = JSON.parse(saved) as string[]
            useAchievementStore.setState(state => ({
                achievements: state.achievements.map(a => ({
                    ...a,
                    unlocked: unlockedIds.includes(a.id)
                }))
            }))
        }
    } catch (e) {
        console.warn('Failed to load achievements', e)
    }
}
