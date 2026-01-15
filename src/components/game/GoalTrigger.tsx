import React, { useRef } from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import useGameStore from '../../stores/gameStore'

interface GoalTriggerProps {
    position: [number, number, number]
    size?: [number, number, number]
}

const GoalTrigger: React.FC<GoalTriggerProps> = ({ position, size = [2, 2, 2] }) => {
    const setVictory = useGameStore(state => state.setVictory)
    const hasTriggered = useRef(false)

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false} // We define custom sensor collider
            sensor
            onIntersectionEnter={({ other }) => {
                if (hasTriggered.current) return

                // Check if 'player' entered
                // Ideally check user data or name, but simplified for now
                if (other.rigidBodyObject?.name === 'player') {
                    hasTriggered.current = true
                    setVictory()
                }
            }}
        >
            <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} sensor />

            {/* Debug Visual (Optional, can remove for shipping) */}
            {/* <mesh>
                <boxGeometry args={size} />
                <meshBasicMaterial color="green" wireframe transparent opacity={0.2} />
            </mesh> */}
        </RigidBody>
    )
}

export default GoalTrigger
