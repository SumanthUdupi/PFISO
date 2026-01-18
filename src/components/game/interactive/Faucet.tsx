import React, { useState } from 'react'

export const Faucet: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    const [isOn, setIsOn] = useState(false)

    return (
        <group position={position} rotation={rotation} onClick={() => setIsOn(!isOn)}>
            {/* Spout */}
            <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.05, 0.05, 0.5]} />
                <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.15, 0.65, 0]}>
                <sphereGeometry args={[0.08]} />
                <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Handle */}
            <mesh position={[0.15, 0.75, 0]} rotation={[0, 0, isOn ? 0.5 : 0]}>
                <boxGeometry args={[0.2, 0.05, 0.05]} />
                <meshStandardMaterial color="gold" metalness={0.8} />
            </mesh>

            {/* Water Stream (Simplified) */}
            {isOn && (
                <mesh position={[0.18, 0.25, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.5]} />
                    <meshBasicMaterial color="#4fc3f7" transparent opacity={0.6} />
                </mesh>
            )}

            {/* Base Sink (Optional context) */}
            <mesh position={[0.2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.3]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    )
}
