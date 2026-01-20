import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import * as THREE from 'three'

interface VisibilityZoneProps {
    position: [number, number, number]
    range?: number
    children: React.ReactNode
    debug?: boolean
}

export function VisibilityZone({ position, range = 20, children, debug = false }: VisibilityZoneProps) {
    const group = useRef<Group>(null)
    const [visible, setVisible] = useState(true)
    // Use ref for position to avoid recreation, though props usually stable-ish.
    // Actually we can just compute distance from prop.
    const posVec = new THREE.Vector3(...position)

    useFrame((state) => {
        // PERF-006: Occlusion Culling (Distance Based)
        // Check distance squared for performance
        const distSq = state.camera.position.distanceToSquared(posVec)
        const rangeSq = range * range

        const isVisible = distSq < rangeSq

        if (isVisible !== visible) {
            setVisible(isVisible)
        }
    })

    return (
        <group ref={group} visible={visible}>
            {children}
            {debug && (
                <mesh position={position}>
                    <sphereGeometry args={[range, 16, 16]} />
                    <meshBasicMaterial color="red" wireframe opacity={0.1} transparent />
                </mesh>
            )}
        </group>
    )
}
