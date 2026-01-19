import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

export const Elevator = (props: any) => {
    const rb = useRef<RapierRigidBody>(null)
    const [targetY, setTargetY] = useState(0)

    // CL-027: Elevator Fall - Ensure kinematic update handles player contact
    // By using setNextKinematicTranslation, Rapier calculates velocity and friction
    // allowing the player to "ride" the elevator without clipping through.
    useFrame((state) => {
        if (rb.current) {
            const time = state.clock.elapsedTime
            const y = Math.sin(time) * 5 + 5 // 0 to 10m
            const currentPos = rb.current.translation()
            rb.current.setNextKinematicTranslation({ x: currentPos.x, y: y, z: currentPos.z })
        }
    })

    return (
        <RigidBody ref={rb} type="kinematicPosition" colliders={false} {...props}>
            <CuboidCollider args={[2, 0.1, 2]} friction={1.0} /> {/* High friction needed */}
            <Box args={[4, 0.2, 4]}>
                <meshStandardMaterial color="#607d8b" />
            </Box>
        </RigidBody>
    )
}
