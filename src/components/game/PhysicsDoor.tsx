import React, { useRef } from 'react'
import { RigidBody, useRevoluteJoint } from '@react-three/rapier'
import { Box } from '@react-three/drei'

// PH-036: Door Physics
// Uses a Revolute Joint to simulate a hinge.

export const PhysicsDoor = ({ position = [0, 0, 0] }: any) => {
    const frameRef = useRef(null)
    const doorRef = useRef(null)

    useRevoluteJoint(frameRef, doorRef, [
        [0.55, 0, 0], // Anchor on Body A (Frame) - Edge of frame
        [-0.5, 0, 0], // Anchor on Body B (Door) - Edge of door
        [0, 1, 0],    // Hinge Axis (Y)
    ])

    return (
        <group position={position}>
            {/* Fixed Frame */}
            <RigidBody ref={frameRef} type="fixed" colliders="cuboid">
                <Box args={[0.1, 3, 0.1]} position={[0.6, 1.5, 0]}>
                    <meshStandardMaterial color="#444" />
                </Box>
            </RigidBody>

            {/* Dynamic Door Panel */}
            <RigidBody
                ref={doorRef}
                colliders="cuboid"
                mass={5}
                linearDamping={0.5}
                angularDamping={0.5} // Damping to prevent infinite swinging
            >
                <Box args={[1, 3, 0.1]} position={[0, 1.5, 0]}>
                    <meshStandardMaterial color="#8B4513" />
                </Box>
            </RigidBody>
        </group>
    )
}
