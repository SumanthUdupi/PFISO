import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

interface SupplyShelfProps {
    position: [number, number, number]
    rotation?: [number, number, number]
}

const SupplyShelf: React.FC<SupplyShelfProps> = ({ position, rotation = [0, 0, 0] }) => {
    const groupRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)
    useCursor(hovered)

    useFrame((state) => {
        if (!groupRef.current) return

        if (hovered) {
            // Shake effect
            groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 50) * 0.02
        } else {
             groupRef.current.position.x = position[0]
        }
    })

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
             {/* Frame */}
            <mesh position={[-0.4, 1, -0.2]}>
                <boxGeometry args={[0.05, 2, 0.05]} />
                <meshStandardMaterial color="#d7ccc8" />
            </mesh>
             <mesh position={[0.4, 1, -0.2]}>
                <boxGeometry args={[0.05, 2, 0.05]} />
                <meshStandardMaterial color="#d7ccc8" />
            </mesh>
             <mesh position={[-0.4, 1, 0.2]}>
                <boxGeometry args={[0.05, 2, 0.05]} />
                <meshStandardMaterial color="#d7ccc8" />
            </mesh>
             <mesh position={[0.4, 1, 0.2]}>
                <boxGeometry args={[0.05, 2, 0.05]} />
                <meshStandardMaterial color="#d7ccc8" />
            </mesh>

            {/* Shelves */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.9, 0.05, 0.45]} />
                <meshStandardMaterial color="#fcf4e8" />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[0.9, 0.05, 0.45]} />
                <meshStandardMaterial color="#fcf4e8" />
            </mesh>
             <mesh position={[0, 1.9, 0]}>
                <boxGeometry args={[0.9, 0.05, 0.45]} />
                <meshStandardMaterial color="#fcf4e8" />
            </mesh>

            {/* Items */}
            {/* Box Figma */}
            <mesh position={[-0.2, 1.4, 0]}>
                <boxGeometry args={[0.2, 0.3, 0.2]} />
                <meshStandardMaterial color="#A259FF" /> {/* Figma Purple */}
            </mesh>
            {/* Book Python */}
            <mesh position={[0.1, 1.35, 0]}>
                <boxGeometry args={[0.08, 0.25, 0.2]} />
                <meshStandardMaterial color="#306998" /> {/* Python Blue */}
            </mesh>
             <mesh position={[0.2, 1.35, 0]}>
                <boxGeometry args={[0.08, 0.25, 0.2]} />
                <meshStandardMaterial color="#FFD43B" /> {/* Python Yellow */}
            </mesh>

            {/* Trophy */}
             <mesh position={[0, 0.7, 0]}>
                <cylinderGeometry args={[0.05, 0.1, 0.3]} />
                <meshStandardMaterial color="#f1c40f" metalness={1} roughness={0} />
            </mesh>
        </group>
    )
}

export default SupplyShelf
