import React from 'react'
import { CopyMachine, ServerRack, PaperStack, TrashCan, OfficeWall, CeilingLight, FireExtinguisher } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const UtilityArea = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor - Vinyl or concrete */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[4, 0.1, 5]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#90a4ae" roughness={0.7} />
                </Box>
            </RigidBody>

            {/* Equipment */}
            <CopyMachine position={[-1, 0, -1]} rotation={[0, Math.PI / 2, 0]} />
            <ServerRack position={[1, 0, -1.5]} />
            <PaperStack position={[-1, 1.1, -0.6]} />

            {/* Storage/Filing could be here too */}

            <TrashCan position={[-1.5, 0, 1]} />

            {/* Safety */}
            <FireExtinguisher position={[1.5, 0, 2]} />

            <CeilingLight position={[0, 3, 0]} />

            {/* Walls enclosing if not provided by external layout */}
            {/* Assuming this is a room off a hallway */}
        </group>
    )
}
