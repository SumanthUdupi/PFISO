import React from 'react'
import { OfficeDesk, OfficeChair, CubiclePartition, FilingCabinet, DesktopComputer, TrashCan, PaperStack, OfficePlant } from './OptimizedOfficeAssets'
import { RigidBody } from '@react-three/rapier'
import { Box } from '@react-three/drei'

// Single Cubicle Unit
const CubicleUnit = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props
    return (
        <group position={position} rotation={rotation}>
            {/* Partitions */}
            <CubiclePartition position={[0, 0, -1]} width={2} />
            <CubiclePartition position={[-1, 0, 0]} width={2} rotation={[0, Math.PI / 2, 0]} />

            {/* Desk */}
            <OfficeDesk position={[0, 0, -0.4]} />

            {/* Chair */}
            <OfficeChair position={[0, 0, 0.5]} rotation={[0, Math.PI, 0]} />

            {/* Props */}
            <FilingCabinet position={[0.7, 0, -0.4]} />
            <DesktopComputer position={[0.3, 0.75, -0.4]} />
            <TrashCan position={[-0.7, 0, 0.5]} />
            <PaperStack position={[-0.5, 0.8, -0.3]} />
        </group>
    )
}

// Cluster of 4
export const CubicleCluster = (props: any) => {
    const { position = [0, 0, 0], rotation = [0, 0, 0] } = props

    return (
        <group position={position} rotation={rotation}>
            {/* Floor section for this cluster */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[6, 0.1, 6]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#cfd8dc" roughness={0.8} />
                </Box>
            </RigidBody>

            <CubicleUnit position={[-1, 0, -1]} rotation={[0, 0, 0]} />
            <CubicleUnit position={[1, 0, -1]} rotation={[0, -Math.PI / 2, 0]} />
            <CubicleUnit position={[-1, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
            <CubicleUnit position={[1, 0, 1]} rotation={[0, Math.PI, 0]} />

            {/* Center Divider/Column */}
            <RigidBody type="fixed" colliders="cuboid">
                <Box args={[0.2, 3, 0.2]} position={[0, 1.5, 0]}>
                    <meshStandardMaterial color="#90a4ae" />
                </Box>
            </RigidBody>

            {/* Center Plant */}
            <OfficePlant position={[0, 0, 0]} />
        </group>
    )
}
