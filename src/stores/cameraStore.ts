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
    // CS-047: Damage Shake Direction
    shakeDirection: THREE.Vector3
    setShakeDirection: (dir: THREE.Vector3) => void
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
    shoulderSide: 'RIGHT' | 'LEFT'
    toggleShoulderSide: () => void
    resetCamera: () => void
    resetVersion: number
    lockTarget: THREE.Vector3 | null // CS-011
    setLockTarget: (target: THREE.Vector3 | null) => void
    focalLength: number // CS-015
    setFocalLength: (mm: number) => void
    sensitivityX: number // CS-018
    sensitivityY: number
    setSensitivityX: (s: number) => void
    setSensitivityY: (s: number) => void
    deadzone: number // CS-019
    setDeadzone: (d: number) => void
    stabilizeRoll: boolean // CS-017
    setStabilizeRoll: (v: boolean) => void
    // CS-044: Camera Zones (Overrides)
    overrides: { distance?: number, fov?: number, heightOffset?: number } | null
    setOverrides: (o: { distance?: number, fov?: number, heightOffset?: number } | null) => void
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
    decayTrauma: (delta) => set((state) => ({ trauma: Math.max(0, state.trauma - delta * 0.45) })), // Decay factor (CS-004: Tuned to 0.45)
    getShake: () => {
        const t = get().trauma
        return t * t * t // Cubic or Quadratic falloff
    },
    shakeDirection: new THREE.Vector3(1, 1, 1),
    setShakeDirection: (dir) => set({ shakeDirection: dir }),
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
    setZoomLevel: (z: number) => set({ zoomLevel: Math.max(0.5, Math.min(2.0, z)) }),
    shoulderSide: 'RIGHT',
    toggleShoulderSide: () => set((state) => ({ shoulderSide: state.shoulderSide === 'RIGHT' ? 'LEFT' : 'RIGHT' })),
    resetCamera: () => set((state) => ({ trauma: 0, shoulderSide: 'RIGHT', resetVersion: state.resetVersion + 1 })),
    resetVersion: 0,
    // CS-011: Target Lock
    lockTarget: null,
    setLockTarget: (target) => set({ lockTarget: target }),
    // CS-015: Photo Mode Lens
    focalLength: 35,
    setFocalLength: (mm) => {
        const sensorWidth = 36
        const fov = 2 * Math.atan(sensorWidth / (2 * mm)) * (180 / Math.PI)
        set({ focalLength: mm, fovBase: fov })
    },
    // CS-018: Sensitivity X/Y
    sensitivityX: 1.0,
    sensitivityY: 1.0,
    setSensitivityX: (s) => set({ sensitivityX: s }),
    setSensitivityY: (s) => set({ sensitivityY: s }),
    // CS-019: Deadzone
    deadzone: 0.1,
    setDeadzone: (d) => set({ deadzone: d }),
    // CS-017: Roll Stabilization
    // CS-017: Roll Stabilization
    stabilizeRoll: true,
    setStabilizeRoll: (v) => set({ stabilizeRoll: v }),
    // CS-044: Camera Zones
    overrides: null,
    setOverrides: (o) => set({ overrides: o })
}))

export default useCameraStore
