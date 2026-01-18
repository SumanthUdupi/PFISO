import React, { useMemo } from 'react'
import { Cylinder, Cone, Sphere } from '@react-three/drei'
import { PhysicsProp } from './PhysicsProp'

interface SucculentProps {
    id: string
    position: [number, number, number]
}

export const Succulent: React.FC<SucculentProps> = ({ id, position }) => {
    // Generate random leaves rotation
    const leaves = useMemo(() => {
        const items = []
        const layers = 3
        for (let l = 0; l < layers; l++) {
            const count = 6 + l * 4
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + (l * 0.5)
                items.push({
                    rot: [0.5 - (l * 0.1), angle, 0],
                    pos: [Math.sin(angle) * (0.02 + l * 0.03), 0.08 + l * 0.02, Math.cos(angle) * (0.02 + l * 0.03)],
                    scale: 0.8 + l * 0.2
                })
            }
        }
        return items
    }, [])

    return (
        <PhysicsProp
            id={id}
            position={position}
            type="custom"
            colliderType="hull" // Use hull for better fit or cylinder equivalent
        // Simple cylinder collider via hull
        >
            <group>
                {/* Pot - White Concrete */}
                <Cylinder args={[0.08, 0.06, 0.08, 16]} castShadow receiveShadow position={[0, 0.04, 0]}>
                    <meshStandardMaterial color="#ffffff" roughness={0.8} />
                </Cylinder>

                {/* Soil */}
                <Cylinder args={[0.07, 0.01, 0.02]} position={[0, 0.075, 0]}>
                    <meshStandardMaterial color="#3e2723" roughness={1} />
                </Cylinder>

                {/* Plant - Sage Green Echeveria */}
                <group position={[0, 0.06, 0]}>
                    {leaves.map((leaf, idx) => (
                        <group key={idx} rotation={leaf.rot as any} position={leaf.pos as any}>
                            <Cone args={[0.02, 0.06, 4]} scale={leaf.scale} castShadow receiveShadow>
                                <meshStandardMaterial color="#ccd5ae" roughness={0.6} flatShading />
                            </Cone>
                        </group>
                    ))}
                    {/* Center Bud */}
                    <Sphere args={[0.015]} position={[0, 0.09, 0]}>
                        <meshStandardMaterial color="#e9edc9" />
                    </Sphere>
                </group>
            </group>
        </PhysicsProp>
    )
}
