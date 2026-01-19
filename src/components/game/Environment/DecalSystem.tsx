import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Decal } from '@react-three/drei'
import * as THREE from 'three'

interface DecalData {
    id: number
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: number
}

export const DecalSystem = forwardRef((props, ref) => {
    // CL-047: Glass Bullet Clip (Snap to normal)
    // Ensures decals are placed correctly on surfaces, aligned with normals, and offset to prevent z-fighting/clipping.

    const [decals, setDecals] = useState<DecalData[]>([])

    useImperativeHandle(ref, () => ({
        addDecal: (point: THREE.Vector3, normal: THREE.Vector3) => {
            // Logic to snap to normal
            const dummy = new THREE.Object3D()
            dummy.position.copy(point)
            dummy.lookAt(point.clone().add(normal))

            // Offset slightly along normal to prevent Z-fighting (Glass Clip fix)
            const offsetPoint = point.clone().add(normal.clone().multiplyScalar(0.01))

            const newDecal = {
                id: Date.now(),
                position: offsetPoint,
                rotation: dummy.rotation.clone(),
                scale: 0.2 + Math.random() * 0.1
            }

            setDecals(prev => [...prev.slice(-20), newDecal]) // Limit to 20 decals
        }
    }))

    return (
        <group>
            {decals.map((d) => (
                <Decal
                    key={d.id}
                    position={d.position}
                    rotation={d.rotation}
                    scale={[d.scale, d.scale, d.scale]}
                >
                    <meshStandardMaterial
                        color="black"
                        transparent
                        opacity={0.8}
                        polygonOffset
                        polygonOffsetFactor={-1} // Further ensure no z-fighting
                    />
                </Decal>
            ))}
        </group>
    )
})
