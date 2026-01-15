import React, { useRef } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import useGameStore from '../../stores/gameStore'

interface VoidTriggerProps {
    position: [number, number, number]
    size?: [number, number, number]
}

const VoidTrigger: React.FC<VoidTriggerProps> = ({ position, size = [1000, 2, 1000] }) => {
    // We can reuse the "damage" action or explicitly "setGameOver".
    // If falling into void, usually instant death.
    const damage = useGameStore(state => state.damage)
    const hasTriggered = useRef(false)

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
            sensor
            onIntersectionEnter={({ other }) => {
                if (hasTriggered.current) return

                if (other.rigidBodyObject?.name === 'player') {
                    hasTriggered.current = true
                    damage(9999) // Instant kill
                }
            }}
        >
            <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} sensor />
        </RigidBody>
    )
}

export default VoidTrigger
