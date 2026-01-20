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

    // UX-006: Color Blind Mode
    colorBlindMode: 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA'
    setColorBlindMode: (val: 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA') => void

    // UX-011: Subtitle Size
    subtitleSize: number
    setSubtitleSize: (val: number) => void

    // UX-022: Streamer Mode
    streamerMode: boolean
    setStreamerMode: (val: boolean) => void

    reticleVisibility: 'ALWAYS' | 'AIMING' | 'HIDDEN'
    setReticleVisibility: (val: 'ALWAYS' | 'AIMING' | 'HIDDEN') => void

    // UX-026: Hardware Cursor
    hardwareCursor: boolean
    setHardwareCursor: (val: boolean) => void

    // UX-029: Resolution Scale
    resolutionScale: number
    setResolutionScale: (val: number) => void

    // UX-036: Safe Area
    safeAreaMargin: number // 0 to 0.1 (0% - 10%)
    setSafeAreaMargin: (val: number) => void

    // UX-037: Credits Speed
    creditsSpeed: number // 0.5 to 2.0
    setCreditsSpeed: (val: number) => void

    // UX-039: Gamma
    gamma: number // 0.5 to 1.5
    setGamma: (val: number) => void

    // UX-042: Loot Visibility
    lootVisibility: 'ALWAYS' | 'HOVER' | 'NEARBY'
    setLootVisibility: (val: 'ALWAYS' | 'HOVER' | 'NEARBY') => void

    // UX-045: Fast Animations
    fastAnimations: boolean
    setFastAnimations: (val: boolean) => void

    // UX-046: Stamina Visibility
    staminaVisibility: 'ALWAYS' | 'DYNAMIC' | 'HIDDEN'
    setStaminaVisibility: (val: 'ALWAYS' | 'DYNAMIC' | 'HIDDEN') => void

    // UX-049: Subtitle Background Opacity
    subtitleBackgroundOpacity: number // 0.0 to 1.0
    setSubtitleBackgroundOpacity: (val: number) => void

    // UX-050: Reduced Motion
    reducedMotion: boolean
    setReducedMotion: (val: boolean) => void
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
            setQualityPreset: (val) => set({ qualityPreset: val }),
            colorBlindMode: 'NONE',
            setColorBlindMode: (val) => set({ colorBlindMode: val }),
            subtitleSize: 1.0,
            setSubtitleSize: (val) => set({ subtitleSize: val }),

            // UX-022: Streamer Mode
            streamerMode: false,
            setStreamerMode: (val) => set({ streamerMode: val }),

            // UX-023: Reticle Visibility
            reticleVisibility: 'ALWAYS', // 'ALWAYS' | 'AIMING' | 'HIDDEN'
            setReticleVisibility: (val) => set({ reticleVisibility: val }),

            hardwareCursor: false,
            setHardwareCursor: (val) => set({ hardwareCursor: val }),

            setResolutionScale: (val) => set({ resolutionScale: val }),

            // UX-036, UX-037, UX-039 (Existing)
            safeAreaMargin: 0,
            setSafeAreaMargin: (val) => set({ safeAreaMargin: val }),
            creditsSpeed: 1,
            setCreditsSpeed: (val) => set({ creditsSpeed: val }),
            gamma: 1.0,
            setGamma: (val) => set({ gamma: val }),

            // UX-042, UX-045
            lootVisibility: 'HOVER',
            setLootVisibility: (val) => set({ lootVisibility: val }),
            fastAnimations: false,
            setFastAnimations: (val) => set({ fastAnimations: val }),

            // UX-046, UX-049, UX-050
            staminaVisibility: 'DYNAMIC',
            setStaminaVisibility: (val) => set({ staminaVisibility: val }),
            subtitleBackgroundOpacity: 0.5,
            setSubtitleBackgroundOpacity: (val) => set({ subtitleBackgroundOpacity: val }),
            reducedMotion: false,
            setReducedMotion: (val) => set({ reducedMotion: val }),
        }),
        {
            name: 'user-settings', // unique name
        }
    )
)
