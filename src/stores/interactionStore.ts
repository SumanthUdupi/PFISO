import { create } from 'zustand'
import * as THREE from 'three'

interface InteractiveObjectData {
    id: string
    position: THREE.Vector3
    label: string
    type: 'projects' | 'about' | 'contact' | 'custom' | 'physics'
    onInteract: () => void
    ref: React.RefObject<THREE.Object3D>
    rbRef?: React.RefObject<any> // RapierRigidBody
}

interface InteractionState {
    registry: Map<string, InteractiveObjectData>
    hoveredId: string | null
    softLockedId: string | null
    heldObjectId: string | null

    // Actions
    registerObject: (id: string, data: InteractiveObjectData) => void
    unregisterObject: (id: string) => void
    setHovered: (id: string | null) => void
    setSoftLocked: (id: string | null) => void
    grabObject: (id: string) => void
    dropObject: () => void

    // Computed helper
    getActiveId: () => string | null
}

const useInteractionStore = create<InteractionState>((set, get) => ({
    registry: new Map(),
    hoveredId: null,
    softLockedId: null,
    heldObjectId: null,

    registerObject: (id, data) => set((state) => {
        const newRegistry = new Map(state.registry)
        newRegistry.set(id, data)
        return { registry: newRegistry }
    }),

    unregisterObject: (id) => set((state) => {
        const newRegistry = new Map(state.registry)
        newRegistry.delete(id)
        if (state.heldObjectId === id) {
            return { registry: newRegistry, heldObjectId: null }
        }
        return { registry: newRegistry }
    }),

    setHovered: (id) => set({ hoveredId: id }),
    setSoftLocked: (id) => set({ softLockedId: id }),
    grabObject: (id) => set({ heldObjectId: id }),
    dropObject: () => set({ heldObjectId: null }),

    getActiveId: () => {
        const { hoveredId, softLockedId, heldObjectId } = get()
        // If holding something, that is the active context (usually)
        if (heldObjectId) return heldObjectId
        // Mouse hover takes precedence over soft lock
        return hoveredId || softLockedId
    }
}))

export default useInteractionStore
