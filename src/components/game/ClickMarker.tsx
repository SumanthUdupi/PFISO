import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ClickMarkerProps {
    position: THREE.Vector3 | null
    onComplete: () => void
    valid?: boolean
}

const ClickMarker: React.FC<ClickMarkerProps> = ({ position, onComplete, valid = true }) => {
    const mesh = useRef<THREE.Mesh>(null)
    const ring = useRef<THREE.Mesh>(null)
    const time = useRef(0)

    const color = valid ? '#2ECC71' : '#E74C3C'; // Green or Red
    const shape = valid ? 'circle' : 'cross';

    useEffect(() => {
        if (position) {
            time.current = 0
            if (mesh.current) {
                mesh.current.scale.set(0, 0, 0)
                mesh.current.position.copy(position)
                mesh.current.position.y = 0.05
            }
             if (ring.current) {
                ring.current.scale.set(0, 0, 0)
                ring.current.position.copy(position)
                ring.current.position.y = 0.05
            }
        }
    }, [position])

    useFrame((state, delta) => {
        if (!position) return
        time.current += delta * 2

        if (time.current > 1.0) {
            onComplete()
            return
        }

        const scale = Math.sin(time.current * Math.PI) * 0.5
        const opacity = 1.0 - time.current

        if (mesh.current) {
            mesh.current.scale.setScalar(scale * 1.5)
            // @ts-ignore
            if (mesh.current.material) mesh.current.material.opacity = opacity
        }
        if (ring.current) {
            ring.current.scale.setScalar(time.current * 1.5)
            // @ts-ignore
             if (ring.current.material) ring.current.material.opacity = opacity
        }
    })

    if (!position) return null

    return (
        <>
            <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
                {valid ? (
                    <circleGeometry args={[0.3, 32]} />
                ) : (
                    <planeGeometry args={[0.5, 0.5]} /> // Placeholder for X, or just a red circle
                )}
                <meshBasicMaterial color={color} transparent opacity={0.8} depthTest={false} />
            </mesh>
             <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.4, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} depthTest={false} />
            </mesh>
        </>
    )
}

export default ClickMarker
