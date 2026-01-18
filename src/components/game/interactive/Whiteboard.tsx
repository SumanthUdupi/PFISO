import React, { useState } from 'react'
import { Text } from '@react-three/drei'

export const Whiteboard: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    const [state, setState] = useState(0) // 0: Empty, 1: Brainstorm, 2: Architecture

    const content = [
        "", // Empty
        "Idea: \nA portfolio that feels like\na home.\n\n- Cozy Vibe\n- Interactive Physics\n- Mobile Friendly!", // Brainstorm
        "Architecture:\n[Player] -> [Hub]\n   |\n   +-> [Work Zone]\n   +-> [Project Zone]\n   +-> [Skill Zone]" // Diagram
    ]

    const cycleState = () => {
        setState((prev) => (prev + 1) % content.length)
    }

    const clear = () => {
        setState(0)
    }

    // Expose clear function to window for Eraser to find (simple event bus pattern)
    React.useEffect(() => {
        const handleClear = () => clear()
        window.addEventListener('clear-whiteboard', handleClear)
        return () => window.removeEventListener('clear-whiteboard', handleClear)
    }, [])

    return (
        <group position={position} rotation={rotation}>
            {/* Frame */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[3.2, 2.2, 0.1]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Board Surface */}
            <mesh position={[0, 0, 0.06]} onClick={cycleState}>
                <boxGeometry args={[3, 2, 0.05]} />
                <meshStandardMaterial color="white" roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Tray */}
            <mesh position={[0, -1.1, 0.1]}>
                <boxGeometry args={[3, 0.1, 0.2]} />
                <meshStandardMaterial color="#A0522D" />
            </mesh>

            {/* Content */}
            {state > 0 && (
                <Text
                    position={[-1.4, 0.8, 0.1]}
                    fontSize={0.15}
                    anchorX="left"
                    anchorY="top"
                    maxWidth={2.8}
                    color="#2c3e50"
                // Default font
                >
                    {content[state]}
                </Text>
            )}
        </group>
    )
}
