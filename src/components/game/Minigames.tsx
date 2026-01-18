import React, { useRef, useState } from 'react'
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier'
import { Box, Sphere, Cylinder } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const BasketballHoop = ({ position }: { position: [number, number, number] }) => {
    const [score, setScore] = useState(0)

    // Detector Logic would go here (sensor collider)

    return (
        <group position={position}>
            {/* Backboard */}
            <RigidBody type="fixed">
                <Box args={[1.5, 1, 0.1]} position={[0, 3, 0]} >
                    <meshStandardMaterial color="white" />
                </Box>
                {/* Rim */}
                <Cylinder args={[0.3, 0.3, 0.05]} position={[0, 2.5, 0.3]} rotation={[Math.PI/2, 0, 0]}>
                     <meshStandardMaterial color="orange" />
                </Cylinder>
            </RigidBody>

            {/* Ball */}
            <RigidBody colliders="ball" restitution={0.8} position={[0, 1, 1]}>
                <Sphere args={[0.15]}>
                    <meshStandardMaterial color="orange" />
                </Sphere>
            </RigidBody>
        </group>
    )
}

export const NewtonsCradle = ({ position }: { position: [number, number, number] }) => {
    // Simplified: Just 5 spheres hanging
    // Physics constraint chains are complex in Rapier/R3F without useRevoluteJoint
    // Placeholder visualization
    return (
        <group position={position}>
            <RigidBody type="fixed">
                <Box args={[1, 0.1, 0.5]} position={[0, 1, 0]}>
                    <meshStandardMaterial color="black" />
                </Box>
            </RigidBody>
            {[...Array(5)].map((_, i) => (
                <RigidBody key={i} position={[(i-2)*0.21, 0.5, 0]} colliders="ball" restitution={1}>
                    <Sphere args={[0.1]}>
                        <meshStandardMaterial color="silver" />
                    </Sphere>
                </RigidBody>
            ))}
        </group>
    )
}
