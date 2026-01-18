import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
    // Camera Tuning
    camDamping: number
    setCamDamping: (val: number) => void
    camSensitivity: number
    setCamSensitivity: (val: number) => void
    camDistance: number
    setCamDistance: (val: number) => void
    camLookAhead: number
    setCamLookAhead: (val: number) => void

    // Camera General
    fov: number
    setFov: (fov: number) => void
    mouseSensitivity: number
    setMouseSensitivity: (val: number) => void
    invertY: boolean
    setInvertY: (val: boolean) => void

    // Audio (Example)
    masterVolume: number
    setMasterVolume: (val: number) => void

    // Graphics
    qualityPreset: 'LOW' | 'MEDIUM' | 'HIGH'
    setQualityPreset: (val: 'LOW' | 'MEDIUM' | 'HIGH') => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            // Camera Tuning Defaults
            camDamping: 15,
            setCamDamping: (val) => set({ camDamping: val }),
            camSensitivity: 1.0,
            setCamSensitivity: (val) => set({ camSensitivity: val }),
            camDistance: 8,
            setCamDistance: (val) => set({ camDistance: val }),
            camLookAhead: 0.5,
            setCamLookAhead: (val) => set({ camLookAhead: val }),

            fov: 75,
            setFov: (fov) => set({ fov }),
            mouseSensitivity: 1.0,
            setMouseSensitivity: (val) => set({ mouseSensitivity: val }),
            invertY: false,
            setInvertY: (val) => set({ invertY: val }),
            masterVolume: 1.0,
            setMasterVolume: (val) => set({ masterVolume: val }),
            qualityPreset: 'HIGH',
            setQualityPreset: (val) => set({ qualityPreset: val })
        }),
        {
            name: 'user-settings', // unique name
        }
    )
)
