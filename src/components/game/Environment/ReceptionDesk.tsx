import React, { useRef, useState } from 'react'
import { Text, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ReceptionDeskProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    onClick?: () => void
}

const ReceptionDesk: React.FC<ReceptionDeskProps> = ({ position, rotation = [0, 0, 0], onClick }) => {
    const [hovered, setHovered] = useState(false)
    useCursor(hovered)
    const [blink, setBlink] = useState(true)

    useFrame((state) => {
        if (state.clock.elapsedTime % 1 < 0.5) {
            setBlink(true)
        } else {
            setBlink(false)
        }
    })

    return (
        <group position={position} rotation={rotation}
            onClick={(e) => {
                e.stopPropagation()
                onClick && onClick()
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            {/* Desk Body */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 1, 0.8]} />
                <meshStandardMaterial color="#2c3e50" />
            </mesh>

            {/* Nameplate */}
            <group position={[0.6, 1.05, 0.2]} rotation={[-Math.PI/6, 0, 0]}>
                <mesh>
                    <boxGeometry args={[0.6, 0.15, 0.05]} />
                    <meshStandardMaterial color="#f1c40f" metalness={0.8} roughness={0.2} /> {/* Brass */}
                </mesh>
                 <Text
                    position={[0, 0, 0.03]}
                    fontSize={0.08}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                >
                    VISITOR
                </Text>
            </group>

            {/* Terminal / Monitor */}
            <group position={[-0.4, 1.0, 0]}>
                {/* Stand */}
                <mesh position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.2]} />
                    <meshStandardMaterial color="#95a5a6" />
                </mesh>
                {/* Screen */}
                <mesh position={[0, 0.35, 0]} rotation={[-0.1, 0, 0]}>
                    <boxGeometry args={[0.8, 0.5, 0.05]} />
                    <meshStandardMaterial color="#34495e" />
                </mesh>
                {/* Display */}
                <mesh position={[0, 0.35, 0.03]} rotation={[-0.1, 0, 0]}>
                    <planeGeometry args={[0.7, 0.4]} />
                    <meshBasicMaterial color="black" />
                </mesh>

                {/* Text Content */}
                <Text
                    position={[0, 0.35, 0.04]}
                    rotation={[-0.1, 0, 0]}
                    fontSize={0.08}
                    color={hovered ? "#2ecc71" : "#ecf0f1"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {hovered ? "START" : (blink ? "_ " : "  ")}
                </Text>
            </group>
        </group>
    )
}

export default ReceptionDesk
