import { create } from 'zustand'
import * as THREE from 'three'

export enum CameraMode {
    FOLLOW = 'FOLLOW',
    FIRST_PERSON = 'FIRST_PERSON',
    AIM = 'AIM',
    CUTSCENE = 'CUTSCENE',
    INSPECT = 'INSPECT',
    DIALOG = 'DIALOG'
}

export interface CameraState {
    mode: CameraMode
    setMode: (mode: CameraMode) => void
    sitTarget: THREE.Vector3 | null
    setSitTarget: (target: THREE.Vector3 | null) => void
    dialogTarget: THREE.Vector3 | null
    setDialogTarget: (target: THREE.Vector3 | null) => void
    inspectTarget: THREE.Vector3 | null
    setInspectTarget: (target: THREE.Vector3 | null) => void
    trauma: number
    addTrauma: (amount: number) => void
    decayTrauma: (delta: number) => void
    getShake: () => number // Returns 0-1 (trauma^2)
    sensitivity: number
    setSensitivity: (s: number) => void
    invertX: boolean
    invertY: boolean
    setInvertX: (v: boolean) => void
    setInvertY: (v: boolean) => void
    isLocked: boolean
    setLocked: (v: boolean) => void
    fovBase: number
    setFovBase: (v: number) => void
    zoomLevel: number
    setZoomLevel: (z: number) => void
}

const useCameraStore = create<CameraState>((set, get) => ({
    mode: CameraMode.FOLLOW,
    setMode: (mode) => set({ mode }),
    sitTarget: null,
    setSitTarget: (target) => set({ sitTarget: target }),
    dialogTarget: null,
    setDialogTarget: (target) => set({ dialogTarget: target }),
    inspectTarget: null,
    setInspectTarget: (target) => set({ inspectTarget: target }),
    trauma: 0,
    addTrauma: (amount) => set((state) => ({ trauma: Math.min(1.0, state.trauma + amount) })),
    decayTrauma: (delta) => set((state) => ({ trauma: Math.max(0, state.trauma - delta * 0.8) })), // Decay factor
    getShake: () => {
        const t = get().trauma
        return t * t * t // Cubic or Quadratic falloff
    },
    sensitivity: 1.0,
    setSensitivity: (s: number) => set({ sensitivity: s }),
    invertX: false,
    invertY: false,
    setInvertX: (v: boolean) => set({ invertX: v }),
    setInvertY: (v: boolean) => set({ invertY: v }),
    isLocked: false,
    setLocked: (v: boolean) => set({ isLocked: v }),
    // Config values (synced with SettingsStore if needed)
    fovBase: 75,
    setFovBase: (v: number) => set({ fovBase: v }),
    zoomLevel: 1.0,
    setZoomLevel: (z: number) => set({ zoomLevel: Math.max(0.5, Math.min(2.0, z)) })
}))

export default useCameraStore
