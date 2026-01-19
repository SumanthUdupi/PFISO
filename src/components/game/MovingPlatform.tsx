import React, { useRef, useState } from 'react'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// PH-034: Kinematic Jitter
// Fix: Use setNextKinematicTranslation instead of standard updates.

export const MovingPlatform = ({ startPos = [0, 0, 0], endPos = [0, 5, 0], duration = 3 }: any) => {
    const ref = useRef<RapierRigidBody>(null)
    const [time, setTime] = useState(0)

    useFrame((state, delta) => {
        if (ref.current) {
            // Ping pong time
            const t = (Math.sin(state.clock.elapsedTime / duration) + 1) / 2

            const x = THREE.MathUtils.lerp(startPos[0], endPos[0], t)
            const y = THREE.MathUtils.lerp(startPos[1], endPos[1], t)
            const z = THREE.MathUtils.lerp(startPos[2], endPos[2], t)

            // CRITICAL: Kinematic movement must use setNextKinematicTranslation
            ref.current.setNextKinematicTranslation({ x, y, z })
        }
    })

    return (
        <RigidBody
            ref={ref}
            type="kinematicPosition"
            colliders="cuboid"
            friction={1} // High friction to carry player
        >
            <Box args={[3, 0.2, 3]}>
                <meshStandardMaterial color="#666" />
            </Box>
        </RigidBody>
    )
}
