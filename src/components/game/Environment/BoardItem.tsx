import React, { useRef, useState } from 'react'
import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface BoardItemProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    type: 'sticky-yellow' | 'sticky-blue' | 'polaroid' | 'ticket' | 'sketch'
    onClick?: (e: any) => void
    scale?: number
}

const BoardItem: React.FC<BoardItemProps> = ({
    position,
    rotation = [0, 0, 0],
    type,
    onClick,
    scale = 1
}) => {
    const meshRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)
    useCursor(hovered)

    // Animation state
    const targetScale = hovered ? scale * 1.1 : scale
    const currentScale = useRef(scale)

    // Random offset for idle wobble
    const randomOffset = useRef(Math.random() * 100)

    useFrame((state, delta) => {
        if (!meshRef.current) return

        // Smooth scale
        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, delta * 10)
        meshRef.current.scale.setScalar(currentScale.current)

        // Idle wobble
        const t = state.clock.elapsedTime + randomOffset.current
        if (hovered) {
             // Straighten up on hover
             meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 5)
        } else {
             // Gentle sway
             meshRef.current.rotation.z = rotation[2] + Math.sin(t * 2) * 0.02
        }
    })

    const getColor = () => {
        switch (type) {
            case 'sticky-yellow': return '#F1C40F'
            case 'sticky-blue': return '#3498DB'
            case 'polaroid': return '#ECF0F1'
            case 'ticket': return '#E67E22'
            case 'sketch': return '#BDC3C7'
            default: return '#FFF'
        }
    }

    const getGeometry = () => {
        // Simple placeholders
        switch (type) {
            case 'sticky-yellow':
            case 'sticky-blue':
                return <boxGeometry args={[0.3, 0.3, 0.01]} />
            case 'polaroid':
                return <boxGeometry args={[0.25, 0.3, 0.01]} />
            case 'ticket':
                return <boxGeometry args={[0.3, 0.15, 0.01]} />
            case 'sketch':
                return <planeGeometry args={[0.3, 0.3]} />
            default:
                return <boxGeometry args={[0.3, 0.3, 0.01]} />
        }
    }

    return (
        <group
            ref={meshRef}
            position={position}
            rotation={rotation}
            onClick={(e) => {
                e.stopPropagation()
                onClick && onClick(e)
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <mesh castShadow receiveShadow>
                {getGeometry()}
                <meshStandardMaterial color={getColor()} />
            </mesh>

            {/* Visual Detail for Polaroid (Black inner square) */}
            {type === 'polaroid' && (
                <mesh position={[0, 0.02, 0.01]}>
                    <planeGeometry args={[0.2, 0.2]} />
                    <meshBasicMaterial color="#222" />
                </mesh>
            )}

            {/* Pin/Magnet */}
            <mesh position={[0, 0.12, 0.02]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="red" />
            </mesh>
        </group>
    )
}

export default BoardItem
