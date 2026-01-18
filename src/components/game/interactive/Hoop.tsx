import React, { useRef, useState } from 'react'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useAudioStore } from '../../../components/audio/GlobalAudio' // Correct import path if needed, or use store

// Simplified Hoop
export const Hoop: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const [score, setScore] = useState(0)
    const [scoredRecently, setScoredRecently] = useState(false)
    // const playSound = useAudioStore(state => state.playSound) // Assuming this exists or similar

    const onIntersectionEnter = (payload: any) => {
        // Check if it's the ball
        // For simplicity, any dynamic object triggers score for now
        if (!scoredRecently) {
            setScore(s => s + 1)
            setScoredRecently(true)
            // console.log("Score!")
            // Play particle effect or sound

            setTimeout(() => setScoredRecently(false), 2000)
        }
    }

    return (
        <group position={position}>
            {/* Backboard */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 3, -0.5]} receiveShadow>
                    <boxGeometry args={[1.8, 1.2, 0.1]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </RigidBody>

            {/* Rim */}
            <RigidBody type="fixed" colliders="trimesh">
                <mesh position={[0, 2.5, 0.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <torusGeometry args={[0.45, 0.02, 16, 32]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            </RigidBody>

            {/* Net Sensor (Invisible) */}
            <RigidBody type="fixed" sensor onIntersectionEnter={onIntersectionEnter}>
                <CylinderCollider args={[0.1, 0.3]} position={[0, 2.3, 0.1]} />
            </RigidBody>

            {/* Score Display (World UI) */}
            <Html position={[0, 4, 0]} center transform>
                <div className="bg-black/50 text-white px-4 py-2 rounded font-mono text-xl font-bold border border-white/20 backdrop-blur-md">
                    SCORE: {score}
                </div>
            </Html>
        </group>
    )
}
