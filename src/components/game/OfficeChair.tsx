import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { Box, Cylinder } from '@react-three/drei'

// PH-040: Chair Wheels
// Simplified rolling via low friction base.

export const OfficeChair = ({ position }: any) => {
    return (
        <RigidBody
            position={position}
            colliders="cuboid"
            friction={0.05} // Slippery base = rolling wheels feel
            linearDamping={0.5} // Stops eventually
            angularDamping={0.5}
            lockRotations // Keep upright? Or maybe just high angular damping on X/Z
            enabledRotations={[false, true, false]} // Keep upright for now, easy chair
        >
            {/* Seat */}
            <Box args={[0.5, 0.1, 0.5]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="black" />
            </Box>
            {/* Back */}
            <Box args={[0.5, 0.6, 0.1]} position={[0, 0.8, -0.2]}>
                <meshStandardMaterial color="black" />
            </Box>
            {/* Base/Wheels */}
            <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color="silver" />
            </Cylinder>
            <Cylinder args={[0.05, 0.05, 0.4]} position={[0, 0.3, 0]}>
                <meshStandardMaterial color="silver" />
            </Cylinder>
        </RigidBody>
    )
}
