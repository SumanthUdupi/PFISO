
// MECH-031: Finite State Machine

export type StateName = 'IDLE' | 'PATROL' | 'CHASE' | 'INTERACT'

export interface AIState {
    name: StateName
    enter: (context: NPCContext) => void
    update: (context: NPCContext, delta: number) => StateName | null // Returns new state or null
    exit: (context: NPCContext) => void
}

export interface NPCContext {
    position: THREE.Vector3
    targetPosition: THREE.Vector3
    playerPos: THREE.Vector3
    path: THREE.Vector3[]
    moveSpeed: number
    waitTimer: number
    canSeePlayer: boolean
    distanceToPlayer: number
}

export class StateMachine {
    currentState: AIState
    context: NPCContext

    constructor(initialState: AIState, context: NPCContext) {
        this.currentState = initialState
        this.context = context
        this.currentState.enter(this.context)
    }

    update(delta: number) {
        const newStateName = this.currentState.update(this.context, delta)
        if (newStateName) {
            // Transition would happen here, but we need a registry of states to look up the new one.
            // For simplicity in this non-class based component world, we might handle transition logic inside the component 
            // OR pass the registry.
            return newStateName
        }
        return null
    }
}
