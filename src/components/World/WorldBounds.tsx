import React from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

export const WorldBounds = () => {
    // CL-040: Out of Bounds - Invisible Walls at map edges
    return (
        <RigidBody type="fixed" colliders={false}>
            {/* North */}
            <CuboidCollider args={[50, 10, 1]} position={[0, 10, -50]} />
            {/* South */}
            <CuboidCollider args={[50, 10, 1]} position={[0, 10, 50]} />
            {/* East */}
            <CuboidCollider args={[1, 10, 50]} position={[50, 10, 0]} />
            {/* West */}
            <CuboidCollider args={[1, 10, 50]} position={[-50, 10, 0]} />
            {/* Ceiling (prevent fly glitch) */}
            <CuboidCollider args={[50, 1, 50]} position={[0, 30, 0]} />
        </RigidBody>
    )
}
