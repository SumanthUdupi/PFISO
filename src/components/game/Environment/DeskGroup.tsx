import React, { useRef } from 'react'
import * as THREE from 'three'
import ActiveScreen from './ActiveScreen'

interface DeskGroupProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    variant?: 'work' | 'empty'
}

const DeskGroup: React.FC<DeskGroupProps> = ({ position, rotation = [0, 0, 0], variant = 'work' }) => {

    // Desk Geometry
    // Table top
    // Legs

    return (
        <group position={position} rotation={rotation}>
            {/* Table Top */}
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 0.1, 1]} />
                <meshStandardMaterial color="#8e44ad" /> {/* Purple-ish desk */}
            </mesh>

            {/* Legs */}
            <mesh position={[-0.9, 0.35, 0.4]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 0.7, 0.1]} />
                <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[0.9, 0.35, 0.4]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 0.7, 0.1]} />
                <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[-0.9, 0.35, -0.4]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 0.7, 0.1]} />
                <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[0.9, 0.35, -0.4]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 0.7, 0.1]} />
                <meshStandardMaterial color="#34495e" />
            </mesh>

            {/* Clutter */}
            {variant === 'work' && (
                <>
                    {/* Monitor Stand */}
                    <mesh position={[0, 0.8, -0.3]} castShadow receiveShadow>
                        <boxGeometry args={[0.2, 0.1, 0.2]} />
                        <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                    {/* Monitor Screen Frame */}
                    <mesh position={[0, 1.0, -0.3]} rotation={[0, 0, 0]} castShadow receiveShadow>
                         <boxGeometry args={[0.8, 0.5, 0.05]} />
                         <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                    {/* Active Screen */}
                    <ActiveScreen
                        position={[0, 1.0, -0.27]}
                        rotation={[0, 0, 0]}
                        size={[0.7, 0.4, 1]}
                    />

                    {/* Mug */}
                    <mesh position={[0.6, 0.8, 0.2]} castShadow receiveShadow>
                        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                        <meshStandardMaterial color="#e74c3c" />
                    </mesh>

                    {/* Papers */}
                    <mesh position={[-0.5, 0.76, 0.1]} rotation={[0, 0.2, 0]} receiveShadow>
                         <boxGeometry args={[0.2, 0.02, 0.3]} />
                         <meshStandardMaterial color="#ecf0f1" />
                    </mesh>
                </>
            )}
        </group>
    )
}

export default DeskGroup
