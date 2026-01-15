import React from 'react'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import * as THREE from 'three'

export interface PropProps {
    type: 'crate' | 'barrel' | 'pillar' | 'bench'
    position: [number, number, number]
    rotation?: [number, number, number]
    size?: [number, number, number] // uniform scale or x,y,z
    physics?: 'dynamic' | 'fixed'
}

const Prop: React.FC<PropProps> = ({
    type,
    position,
    rotation = [0, 0, 0],
    size = [1, 1, 1],
    physics
}) => {
    // Determine visuals and collider based on type
    // Default physics: Crates are dynamic, others fixed, unless overridden
    const rigidType = physics || (type === 'crate' ? 'dynamic' : 'fixed')

    return (
        <RigidBody
            type={rigidType}
            position={new THREE.Vector3(...position)}
            rotation={new THREE.Euler(...rotation)}
            colliders={false} // Custom colliders
        >
            {type === 'crate' && (
                <>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[1 * size[0], 1 * size[1], 1 * size[2]]} />
                        <meshStandardMaterial color="#8B4513" roughness={0.8} />
                    </mesh>
                    <CuboidCollider args={[0.5 * size[0], 0.5 * size[1], 0.5 * size[2]]} />
                </>
            )}

            {type === 'barrel' && (
                <>
                    <mesh castShadow receiveShadow>
                        <cylinderGeometry args={[0.4 * size[0], 0.4 * size[0], 1 * size[1], 16]} />
                        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.6} />
                    </mesh>
                    <CylinderCollider args={[0.5 * size[1], 0.4 * size[0]]} />
                </>
            )}

            {type === 'pillar' && (
                <>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[0.8 * size[0], 4 * size[1], 0.8 * size[2]]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <CuboidCollider args={[0.4 * size[0], 2 * size[1], 0.4 * size[2]]} />
                </>
            )}

            {type === 'bench' && (
                <>
                    <mesh castShadow receiveShadow position={[0, 0.25 * size[1], 0]}>
                        <boxGeometry args={[2 * size[0], 0.5 * size[1], 0.8 * size[2]]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                    <CuboidCollider args={[1 * size[0], 0.25 * size[1], 0.4 * size[2]]} position={[0, 0.25 * size[1], 0]} />
                </>
            )}
        </RigidBody>
    )
}

export default Prop
