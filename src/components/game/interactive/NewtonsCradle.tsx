import React from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

export const NewtonsCradle: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            {/* Frame */}
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[1.2, 0.1, 0.5]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[-0.55, 0.5, 0]} castShadow>
                <boxGeometry args={[0.1, 1, 0.5]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0.55, 0.5, 0]} castShadow>
                <boxGeometry args={[0.1, 1, 0.5]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Balls ( Simplified Physics - Just spheres for now) */}

            <RigidBody position={[-0.3, 0.2, 0]} colliders="ball" restitution={0.9}>
                <mesh><sphereGeometry args={[0.15]} /><meshStandardMaterial color="silver" metalness={1} roughness={0.1} /></mesh>
            </RigidBody>
            <RigidBody position={[-0.15, 0.2, 0]} colliders="ball" restitution={0.9}>
                <mesh><sphereGeometry args={[0.15]} /><meshStandardMaterial color="silver" metalness={1} roughness={0.1} /></mesh>
            </RigidBody>
            <RigidBody position={[0, 0.2, 0]} colliders="ball" restitution={0.9}>
                <mesh><sphereGeometry args={[0.15]} /><meshStandardMaterial color="silver" metalness={1} roughness={0.1} /></mesh>
            </RigidBody>
            <RigidBody position={[0.15, 0.2, 0]} colliders="ball" restitution={0.9}>
                <mesh><sphereGeometry args={[0.15]} /><meshStandardMaterial color="silver" metalness={1} roughness={0.1} /></mesh>
            </RigidBody>
            <RigidBody position={[0.3, 0.2, 0]} colliders="ball" restitution={0.9}>
                <mesh><sphereGeometry args={[0.15]} /><meshStandardMaterial color="silver" metalness={1} roughness={0.1} /></mesh>
            </RigidBody>

            {/* Invisible containment box so they don't roll away */}
            <RigidBody type="fixed">
                <CuboidCollider args={[0.7, 0.1, 0.3]} position={[0, -0.05, 0]} /> {/* Floor */}
                <CuboidCollider args={[0.7, 0.5, 0.1]} position={[0, 0.5, -0.2]} /> {/* Back */}
                <CuboidCollider args={[0.7, 0.5, 0.1]} position={[0, 0.5, 0.2]} /> {/* Front */}
            </RigidBody>
        </group>
    )
}
