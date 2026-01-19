import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

// PH-039: Paper Physics
// High damping allows it to "float" down slowly.

export const PaperSheet = ({ position }: any) => {
    return (
        <RigidBody
            position={position}
            colliders="cuboid"
            mass={0.01}
            linearDamping={2.0} // High drag
            angularDamping={2.0} // High rotational drag
        >
            <Box args={[0.21, 0.001, 0.297]}>
                <meshStandardMaterial color="white" />
            </Box>
        </RigidBody>
    )
}
