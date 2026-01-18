import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Float } from '@react-three/drei'
import useAudioStore from '../../audioStore'
import useGameStore from '../../store'
import gameSystemInstance from '../../systems/GameSystem'
import PositionalSound from '../audio/PositionalSound'

interface MemoryOrbProps {
    id: string
    position: [number, number, number]
    color?: string
}

const MemoryOrb: React.FC<MemoryOrbProps> = ({ id, position, color = "#00ffff" }) => {
    const group = useRef<THREE.Group>(null)
    const { playSound } = useAudioStore()
    const { unlockMemory, unlockedMemories } = useGameStore()
    const [collected, setCollected] = useState(false)
    const [playAudio, setPlayAudio] = useState(false)

    // Check if already collected logic could be added if we persisted state fully 
    // but store handles deduping. To hide it visually on reload, check store.

    // We can't access store state inside the component body reactively easily if we want to hide it immediately. 
    // But we can check unlockedMemories.includes(id).

    const isAlreadyCollected = unlockedMemories.includes(id)
    if (isAlreadyCollected && !collected) setCollected(true) // Sync state

    useFrame((state) => {
        if (!group.current || collected) return

        // Spin
        group.current.rotation.y += 0.02
        group.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1

        // Distance Check
        const playerPos = gameSystemInstance.playerPosition
        const myPos = group.current.position

        const dx = playerPos.x - myPos.x
        const dy = playerPos.y - myPos.y
        const dz = playerPos.z - myPos.z

        if (dx * dx + dy * dy + dz * dz < 1.0) { // < 1 meter
            // Collect
            setPlayAudio(true)
            unlockMemory(id)
            setTimeout(() => setCollected(true), 1000)
            // Maybe dispatch notification?
        }
    })

    if (collected) return null

    return (
        <group ref={group} position={new THREE.Vector3(...position)}>
            <PositionalSound type={id} trigger={playAudio} distance={10} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={2}
                        transparent
                        opacity={0.8}
                        wireframe
                    />
                </mesh>
                <pointLight color={color} distance={3} intensity={5} />

                {/* Core */}
                <mesh scale={0.5}>
                    <icosahedronGeometry args={[0.2, 0]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </Float>
        </group>
    )
}

export default MemoryOrb
