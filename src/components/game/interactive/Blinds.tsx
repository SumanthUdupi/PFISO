import React, { useState } from 'react'
import { useSpring, animated } from '@react-spring/three'

export const Blinds: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Animate slats rotation or height
    const { slatRot } = useSpring({
        slatRot: isOpen ? Math.PI / 2 : 0,
        config: { mass: 1, tension: 170, friction: 26 }
    })

    const toggle = () => setIsOpen(!isOpen)

    return (
        <group position={position} rotation={rotation} onClick={toggle}>
            {/* Top Bar */}
            <mesh position={[0, 1, 0]}>
                <boxGeometry args={[1.2, 0.1, 0.1]} />
                <meshStandardMaterial color="#eee" />
            </mesh>

            {/* Slats */}
            {Array.from({ length: 10 }).map((_, i) => (
                <animated.mesh
                    key={i}
                    position={[0, 0.9 - (i * 0.1), 0]}
                    rotation-x={slatRot}
                >
                    <boxGeometry args={[1.15, 0.08, 0.01]} />
                    <meshStandardMaterial color="white" />
                </animated.mesh>
            ))}

            {/* Strings */}
            <mesh position={[0.5, 0.5, 0.02]}>
                <cylinderGeometry args={[0.005, 0.005, 1]} />
                <meshStandardMaterial color="white" />
            </mesh>
            <mesh position={[-0.5, 0.5, 0.02]}>
                <cylinderGeometry args={[0.005, 0.005, 1]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    )
}
