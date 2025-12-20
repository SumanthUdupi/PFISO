import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import BoardItem from './BoardItem'

interface StrategyBoardProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    onClick?: () => void
}

const StrategyBoard: React.FC<StrategyBoardProps> = ({ position, rotation = [0, 0, 0], onClick }) => {
    const groupRef = useRef<THREE.Group>(null)

    // Animation: Shimmer on glass (Simulated by opacity or emissive pulse)
    useFrame(({ clock }) => {
        // Simple shimmer implementation could go here
    })

    return (
        <group ref={groupRef} position={position} rotation={rotation} onClick={onClick}>
            {/* Stand Legs */}
            <mesh position={[-0.9, 1, 0]} castShadow>
                <boxGeometry args={[0.05, 2, 0.05]} />
                <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.9, 1, 0]} castShadow>
                <boxGeometry args={[0.05, 2, 0.05]} />
                <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Crossbar */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[1.8, 0.05, 0.05]} />
                <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.1, 0.3]} castShadow>
                <boxGeometry args={[1.8, 0.05, 0.6]} />
                <meshStandardMaterial color="#7f8c8d" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Board Frame */}
            <mesh position={[0, 1.5, 0]}>
                <boxGeometry args={[2, 1.2, 0.05]} />
                <meshStandardMaterial color="#ecf0f1" />
            </mesh>

            {/* Glass Panel (Simulated with transparency) */}
            <mesh position={[0, 1.5, 0.03]}>
                <planeGeometry args={[1.9, 1.1]} />
                <meshStandardMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                    metalness={0.1}
                />
            </mesh>

            {/* Items */}
            <BoardItem
                position={[-0.5, 1.7, 0.04]}
                type="sticky-yellow"
                rotation={[0, 0, 0.1]}
                onClick={onClick}
            />
             <BoardItem
                position={[0.2, 1.6, 0.04]}
                type="sticky-blue"
                rotation={[0, 0, -0.05]}
                onClick={onClick}
            />
             <BoardItem
                position={[-0.3, 1.3, 0.04]}
                type="sticky-yellow"
                rotation={[0, 0, 0.05]}
                onClick={onClick}
            />
            <BoardItem
                position={[0.6, 1.4, 0.04]}
                type="sticky-blue"
                rotation={[0, 0, -0.1]}
                onClick={onClick}
            />

            {/* Header Text */}
            {/* We could use Text from drei, but keeping it simple for now or assume textures */}
             <mesh position={[0.7, 1.9, 0.04]}>
                <planeGeometry args={[0.4, 0.1]} />
                <meshBasicMaterial color="red" />
            </mesh>
        </group>
    )
}

export default StrategyBoard
