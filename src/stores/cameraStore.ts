import { create } from 'zustand'

interface CameraState {
    trauma: number
    addTrauma: (amount: number) => void
    decayTrauma: (delta: number) => void
    getShake: () => number // Returns 0-1 (trauma^2)
}

const useCameraStore = create<CameraState>((set, get) => ({
    trauma: 0,
    addTrauma: (amount) => set((state) => ({ trauma: Math.min(1.0, state.trauma + amount) })),
    decayTrauma: (delta) => set((state) => ({ trauma: Math.max(0, state.trauma - delta * 0.8) })), // Decay factor
    getShake: () => {
        const t = get().trauma
        return t * t * t // Cubic or Quadratic falloff
    }
}))

export default useCameraStore
