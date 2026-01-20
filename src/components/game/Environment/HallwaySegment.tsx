import React from 'react'
import { OfficeWall, CeilingLight, ExitSign, FireExtinguisher, SmokeDetector, Sprinkler, AirVent } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const HallwaySegment = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0], length = 4, width = 2 } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[width, 0.1, length]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#bdbdbd" roughness={0.6} />
                </Box>
            </RigidBody>

            {/* Ceiling */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[width, 0.1, length]} position={[0, 3, 0]}>
                    <meshStandardMaterial color="#eceff1" />
                </Box>
            </RigidBody>

            {/* Lights */}
            <CeilingLight position={[0, 2.95, 0]} />
            {length > 4 && <CeilingLight position={[0, 2.95, length / 4]} />}
            {length > 4 && <CeilingLight position={[0, 2.95, -length / 4]} />}


            {/* Optional Details based on length */}
            {length >= 4 && (
                <>
                    <FireExtinguisher position={[width / 2 - 0.2, 0.1, 1]} />
                    <ExitSign position={[0, 2.3, length / 2 - 0.1]} rotation={[0, Math.PI, 0]} />

                    {/* Safety & Utility */}
                    <SmokeDetector position={[0, 2.9, length / 3]} />
                    <Sprinkler position={[0.5, 2.9, -length / 3]} />
                    <AirVent position={[-0.5, 2.95, 0]} rotation={[Math.PI / 2, 0, 0]} />
                </>
            )}

        </group>
    )
}
