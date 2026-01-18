import { create } from 'zustand'

interface CozyState {
    coffeeStatus: 'EMPTY' | 'BREWING' | 'READY' | 'CONSUMED'
    musicTrack: string | null
    plantWaterLevel: number // 0 to 100
    petStatus: 'SLEEPING' | 'FOLLOWING' | 'EATING'

    brewCoffee: () => void
    drinkCoffee: () => void
    setMusic: (track: string) => void
    waterPlant: () => void
    feedPet: () => void
}

const useCozyStore = create<CozyState>((set) => ({
    coffeeStatus: 'EMPTY',
    musicTrack: null,
    plantWaterLevel: 50,
    petStatus: 'SLEEPING',

    brewCoffee: () => {
        set({ coffeeStatus: 'BREWING' })
        setTimeout(() => set({ coffeeStatus: 'READY' }), 3000)
    },
    drinkCoffee: () => {
        set({ coffeeStatus: 'CONSUMED' })
        // Trigger buff here via GameStore if needed
    },
    setMusic: (track) => set({ musicTrack: track }),
    waterPlant: () => set(state => ({ plantWaterLevel: Math.min(100, state.plantWaterLevel + 25) })),
    feedPet: () => set({ petStatus: 'EATING' })
}))

export default useCozyStore
