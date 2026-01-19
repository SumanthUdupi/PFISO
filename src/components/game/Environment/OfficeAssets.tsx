import React, { useRef } from 'react'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'

export const OfficeDesk = (props: any) => {
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            {/* CL-015: Desk Collider Fix - Split into Top and Legs to allow chair under */}
            {/* Top Collider (Size: 2, 0.1, 1) */}
            <CuboidCollider args={[1, 0.05, 0.5]} position={[0, 0.75, 0]} />
            {/* Left Leg Collider */}
            <CuboidCollider args={[0.05, 0.35, 0.45]} position={[-0.9, 0.35, 0]} />
            {/* Right Leg Collider */}
            <CuboidCollider args={[0.05, 0.35, 0.45]} position={[0.9, 0.35, 0]} />

            {/* Top Visual */}
            <Box args={[2, 0.1, 1]} position={[0, 0.75, 0]}>
                <meshStandardMaterial color="#8d6e63" metalness={0.1} roughness={0.8} />
            </Box>
            {/* Legs Visual */}
            <Box args={[0.1, 0.7, 0.9]} position={[-0.9, 0.35, 0]}>
                <meshStandardMaterial color="#4e342e" />
            </Box>
            <Box args={[0.1, 0.7, 0.9]} position={[0.9, 0.35, 0]}>
                <meshStandardMaterial color="#4e342e" />
            </Box>
            {/* Monitor */}
            <Box args={[0.8, 0.5, 0.05]} position={[0, 1.05, -0.3]}>
                {/* REQ-VIS-015: Monitor Screen Shader */}
                <meshPhysicalMaterial
                    color="#050505"
                    roughness={0.2}
                    metalness={0.5}
                    clearcoat={1}
                />
            </Box>
            <Box args={[0.1, 0.2, 0.05]} position={[0, 0.85, -0.3]}>
                <meshStandardMaterial color="#424242" />
            </Box>

            {/* REQ-VIS-039: Keyboard Details */}
            <Box args={[0.5, 0.02, 0.2]} position={[0, 0.81, 0.2]}>
                <meshStandardMaterial color="#212121" />
            </Box>
            <Box args={[0.45, 0.01, 0.15]} position={[0, 0.825, 0.2]}>
                {/* Keys block */}
                <meshStandardMaterial color="#424242" roughness={0.8} />
            </Box>
        </RigidBody>
    )
}

export const OfficeChair = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} linearDamping={2} angularDamping={2}>
            <CuboidCollider args={[0.3, 0.5, 0.3]} position={[0, 0.5, 0]} />
            {/* Seat - REQ-VIS-032: Fabric Material */}
            <Box args={[0.6, 0.1, 0.6]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#455a64" roughness={1.0} />
            </Box>
            {/* Back */}
            <Box args={[0.6, 0.6, 0.1]} position={[0, 0.8, -0.25]}>
                <meshStandardMaterial color="#455a64" roughness={1.0} />
            </Box>
            {/* Base */}
            <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.1, 0]}>
                {/* REQ-VIS-016: Chrome Metalness */}
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={1.0}
                    roughness={0.1}
                />
            </Cylinder>
            <Cylinder args={[0.05, 0.4, 0.05]} position={[0, 0.3, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    metalness={1.0}
                    roughness={0.1}
                />
            </Cylinder>
        </RigidBody>
    )
}

export const OfficePlant = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} density={0.5}>
            <CylinderCollider args={[0.5, 0.3]} position={[0, 0.5, 0]} />
            {/* Pot - REQ-VIS-027: Poly Count Plants (Smoother) */}
            <Cylinder args={[0.3, 0.2, 0.4, 32]} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#d84315" />
            </Cylinder>
            {/* Plant Stem */}
            <Cylinder args={[0.05, 0.05, 0.6]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#2e7d32" />
            </Cylinder>
            {/* Leaves */}
            <Sphere args={[0.4]} position={[0, 0.9, 0]}>
                {/* REQ-VIS-013: Plant SSS/Translucency */}
                <meshPhysicalMaterial
                    color="#4caf50"
                    roughness={0.3}
                    transmission={0.1} // Subtle light passing
                    thickness={0.5}
                />
            </Sphere>
        </RigidBody>
    )
}

export const GlassPartition = (props: any) => {
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            <Box args={[4, 2.5, 0.1]}>
                {/* REQ-VIS-026: Physical Glass */}
                <meshPhysicalMaterial
                    color="#e0f7fa"
                    transmission={0.95}
                    roughness={0.05}
                    thickness={0.1}
                    ior={1.5}
                    transparent
                />
            </Box>
        </RigidBody>
    )
}

export const PaperStack = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="cuboid" {...props}>
            <Box args={[0.2, 0.05, 0.3]}>
                {/* REQ-VIS-028: Paper Roughness */}
                <meshStandardMaterial color="#fafafa" roughness={0.9} metalness={0} />
            </Box>
        </RigidBody>
    )
}

export const TrashCan = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders="hull" {...props}>
            {/* REQ-VIS-048: Trash Cans */}
            <Cylinder args={[0.2, 0.15, 0.4, 16]} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#546e7a" metalness={0.5} />
            </Cylinder>
            {/* Trash Content */}
            <Sphere args={[0.08]} position={[0, 0.3, 0]}>
                <meshStandardMaterial color="#eceff1" />
            </Sphere>
            <Sphere args={[0.07]} position={[0.05, 0.25, -0.05]}>
                <meshStandardMaterial color="#cfd8dc" />
            </Sphere>
        </RigidBody>
    )
}

export const OfficeCable = (props: any) => {
    // CL-022: Cable Clipping - Lift slightly above surface or add collider
    return (
        <RigidBody type="fixed" colliders="hull" {...props}>
            {/* Visual Cable */}
            <Cylinder args={[0.02, 0.02, 2]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#212121" />
            </Cylinder>
        </RigidBody>
    )
}

export const OfficeWall = (props: any) => {
    const w = props.width || 1
    const h = props.height || 3
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[w / 2, h / 2, 0.1]} />
            <Box args={[w, h, 0.2]}>
                <meshStandardMaterial
                    color="#eceff1"
                // normalMap={props.normalMap} // REQ-VIS-005
                />
            </Box>
        </RigidBody>
    )
}
