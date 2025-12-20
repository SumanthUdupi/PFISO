import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

interface MailSlotsProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    onClick?: () => void
}

const MailSlots: React.FC<MailSlotsProps> = ({ position, rotation = [0, 0, 0], onClick }) => {
    const [hovered, setHovered] = useState(false)
    useCursor(hovered)

    return (
        <group
            position={position}
            rotation={rotation}
             onClick={(e) => {
                e.stopPropagation()
                onClick && onClick()
            }}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
             {/* Main Unit */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1.5, 1, 0.3]} />
                <meshStandardMaterial color="#8e44ad" />
            </mesh>

            {/* Slots (Visual Grid) */}
            {Array.from({ length: 6 }).map((_, i) => {
                const x = (i % 3) * 0.4 - 0.4
                const y = Math.floor(i / 3) * 0.4 + 1.3
                return (
                    <mesh key={i} position={[x, y, 0.16]}>
                         <planeGeometry args={[0.3, 0.3]} />
                         <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                )
            })}

            {/* Mail Envelopes sticking out */}
             <mesh position={[-0.4, 1.3, 0.2]} rotation={[0.5, 0, 0]}>
                <boxGeometry args={[0.2, 0.1, 0.01]} />
                <meshStandardMaterial color="#ecf0f1" />
            </mesh>

            {/* Icons floating above */}
             {hovered && (
                 <group position={[0, 2.2, 0]}>
                    <mesh position={[-0.4, 0, 0]}>
                         <sphereGeometry args={[0.1]} />
                         <meshStandardMaterial color="#1DA1F2" />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                         <sphereGeometry args={[0.1]} />
                         <meshStandardMaterial color="#0A66C2" />
                    </mesh>
                    <mesh position={[0.4, 0, 0]}>
                         <sphereGeometry args={[0.1]} />
                         <meshStandardMaterial color="#EA4335" />
                    </mesh>
                 </group>
             )}
        </group>
    )
}

export default MailSlots
