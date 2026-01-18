import React, { useRef } from 'react'
import { Box, Cylinder, Sphere } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'

export const OfficeDesk = (props: any) => {
    return (
        <RigidBody type="fixed" colliders={false} {...props}>
            <CuboidCollider args={[1, 0.6, 0.5]} position={[0, 0.6, 0]} />
            {/* Top */}
            <Box args={[2, 0.1, 1]} position={[0, 0.75, 0]}>
                <meshStandardMaterial color="#8d6e63" metalness={0.1} roughness={0.8} />
            </Box>
            {/* Legs */}
            <Box args={[0.1, 0.7, 0.9]} position={[-0.9, 0.35, 0]}>
                <meshStandardMaterial color="#4e342e" />
            </Box>
            <Box args={[0.1, 0.7, 0.9]} position={[0.9, 0.35, 0]}>
                <meshStandardMaterial color="#4e342e" />
            </Box>
            {/* Monitor */}
            <Box args={[0.8, 0.5, 0.05]} position={[0, 1.05, -0.3]}>
                <meshStandardMaterial color="#212121" />
            </Box>
            <Box args={[0.1, 0.2, 0.05]} position={[0, 0.85, -0.3]}>
                <meshStandardMaterial color="#424242" />
            </Box>
        </RigidBody>
    )
}

export const OfficeChair = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} linearDamping={2} angularDamping={2}>
            <CuboidCollider args={[0.3, 0.5, 0.3]} position={[0, 0.5, 0]} />
            {/* Seat */}
            <Box args={[0.6, 0.1, 0.6]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#37474f" />
            </Box>
            {/* Back */}
            <Box args={[0.6, 0.6, 0.1]} position={[0, 0.8, -0.25]}>
                <meshStandardMaterial color="#37474f" />
            </Box>
            {/* Base */}
            <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color="#cfd8dc" />
            </Cylinder>
            <Cylinder args={[0.05, 0.4, 0.05]} position={[0, 0.3, 0]}>
                <meshStandardMaterial color="#cfd8dc" />
            </Cylinder>
        </RigidBody>
    )
}

export const OfficePlant = (props: any) => {
    return (
        <RigidBody type="dynamic" colliders={false} {...props} density={0.5}>
            <CylinderCollider args={[0.5, 0.3]} position={[0, 0.5, 0]} />
            {/* Pot */}
            <Cylinder args={[0.3, 0.2, 0.4]} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#d84315" />
            </Cylinder>
            {/* Plant Stem */}
            <Cylinder args={[0.05, 0.05, 0.6]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#2e7d32" />
            </Cylinder>
            {/* Leaves */}
            <Sphere args={[0.4]} position={[0, 0.9, 0]}>
                <meshStandardMaterial color="#4caf50" roughness={1} />
            </Sphere>
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
                <meshStandardMaterial color="#eceff1" />
            </Box>
        </RigidBody>
    )
}
