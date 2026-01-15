import { create } from 'zustand'

interface GameState {
    health: number
    maxHealth: number
    score: number
    isPaused: boolean
    isInventoryOpen: boolean

    gameState: 'playing' | 'won' | 'lost'

    // Actions
    damage: (amount: number) => void
    heal: (amount: number) => void
    addScore: (amount: number) => void
    setPaused: (paused: boolean) => void
    togglePause: () => void
    toggleInventory: () => void
    setGameOver: () => void
    setVictory: () => void
    restartGame: () => void
}

const useGameStore = create<GameState>((set) => ({
    health: 100,
    maxHealth: 100,
    score: 0,
    isPaused: false,
    isInventoryOpen: false,

    // gameState: 'playing' | 'won' | 'lost'
    gameState: 'playing',

    damage: (amount) => set((state) => {
        const newHealth = Math.max(0, state.health - amount)
        if (newHealth <= 0 && state.gameState === 'playing') {
            return { health: newHealth, gameState: 'lost', isPaused: true }
        }
        return { health: newHealth }
    }),

    heal: (amount) => set((state) => ({
        health: Math.min(state.maxHealth, state.health + amount)
    })),

    addScore: (amount) => set((state) => ({
        score: state.score + amount
    })),

    setPaused: (paused) => set({ isPaused: paused }),
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
    toggleInventory: () => set((state) => ({ isInventoryOpen: !state.isInventoryOpen })),

    setGameOver: () => set({ gameState: 'lost', isPaused: true }),
    setVictory: () => set({ gameState: 'won', isPaused: true }),
    restartGame: () => set({
        gameState: 'playing',
        health: 100,
        score: 0,
        isPaused: false,
        isInventoryOpen: false
    }),
}))

export default useGameStore
