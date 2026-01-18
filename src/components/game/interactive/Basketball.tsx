import React, { useRef } from 'react'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../../../store'

export const Basketball: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const rigidBody = useRef<RapierRigidBody>(null)
    // We can reuse the Pickup logic if we make this generic, or implement simple pickup here
    // For now, let's make it a simple physics object with high restitution

    // Aesthetic: Orange, lines
    return (
        <RigidBody
            ref={rigidBody}
            position={position}
            colliders="ball"
            restitution={0.8} // Bouncy!
            friction={0.5}
            linearDamping={0.1}
            angularDamping={0.1}
        >
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="orange" roughness={0.4} />
            </mesh>
            {/* Lines (Simplified) */}
            <mesh castShadow rotation={[0, 0, 0]}>
                <torusGeometry args={[0.25, 0.01, 16, 100]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.25, 0.01, 16, 100]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </RigidBody>
    )
}
