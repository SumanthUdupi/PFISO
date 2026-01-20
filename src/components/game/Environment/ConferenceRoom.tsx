import React from 'react'
import { GlassPartition, OfficeChair, ConferenceTable, Whiteboard, ProjectorScreen, OfficePlant } from './OptimizedOfficeAssets'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Box } from '@react-three/drei'

export const ConferenceRoom = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor - Carpet */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[8, 0.1, 6]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#546e7a" roughness={0.8} />
                </Box>
            </RigidBody>

            {/* Ceiling */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[8, 0.1, 6]} position={[0, 3, 0]}>
                    <meshStandardMaterial color="#eceff1" />
                </Box>
            </RigidBody>

            {/* Walls - Glass Partitions */}
            <GlassPartition position={[0, 1.5, 3]} />
            <GlassPartition position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />
            <GlassPartition position={[4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} />

            {/* Back Wall - Solid */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[8, 3, 0.2]} position={[0, 1.5, -3]}>
                    <meshStandardMaterial color="#eceff1" />
                </Box>
            </RigidBody>

            {/* Furniture */}
            <ConferenceTable position={[0, 0, 0]} />

            {/* Chairs placed around */}
            <OfficeChair position={[-1.2, 0.5, 0.8]} rotation={[0, -0.5, 0]} />
            <OfficeChair position={[1.2, 0.5, 0.8]} rotation={[0, 0.5, 0]} />
            <OfficeChair position={[-1.2, 0.5, -0.8]} rotation={[0, -2.5, 0]} />
            <OfficeChair position={[1.2, 0.5, -0.8]} rotation={[0, 2.5, 0]} />
            <OfficeChair position={[-1.2, 0.5, 0]} rotation={[0, -1.5, 0]} />
            <OfficeChair position={[1.2, 0.5, 0]} rotation={[0, 1.5, 0]} />

            {/* Equipment */}
            <Whiteboard position={[2, 1.5, -2.8]} />
            <ProjectorScreen position={[0, 1.5, -2.9]} />

            {/* Decor */}
            <OfficePlant position={[3.5, 0, 2.5]} />
            <OfficePlant position={[-3.5, 0, 2.5]} />

            {/* Lighting */}
            <pointLight position={[0, 2.8, 0]} intensity={0.8} distance={10} decay={2} castShadow />

        </group>
    )
}
