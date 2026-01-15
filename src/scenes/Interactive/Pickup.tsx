import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import GameEntity from '../../components/game/ECS/GameEntity'
import useInventoryStore from '../../stores/inventoryStore'
import useAudioStore from '../../audioStore' // Updated to match user's new file
import globalEvents from '../../systems/EventManager'
import { SparkleBurst } from '../../components/effects/ParticleEffects'

interface PickupProps {
    id: string
    position: [number, number, number]
    type?: 'key' | 'health' | 'ammo'
    label?: string
}

const Pickup: React.FC<PickupProps> = ({ id, position, type = 'key', label = 'Key' }) => {
    const [collected, setCollected] = useState(false)
    const { addItem } = useInventoryStore()
    const { playSound } = useAudioStore()

    const [showEffects, setShowEffects] = useState(false)

    // Animation
    const meshRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (meshRef.current && !collected) {
            meshRef.current.rotation.y += delta * 2
        }
    })

    const onPickup = () => {
        if (collected) return

        setCollected(true)
        setShowEffects(true)
        addItem(id)
        playSound('success')

        // Notify global system
        globalEvents.emit('OBJECT_STATE_CHANGE', { id, state: 'collected' })
    }

    if (collected && !showEffects) return null

    return (
        <GameEntity id={id} tags={['pickup', type]} components={{ collected }}>
            {/* Effect: Only render if we are running the effect */}
            {showEffects && (
                <SparkleBurst
                    position={new THREE.Vector3(...position)}
                    count={30}
                    onComplete={() => setShowEffects(false)} // This will finally remove the component visual
                />
            )}

            {!collected && (
                <RigidBody
                    type="fixed"
                    position={new THREE.Vector3(...position)}
                    sensor
                    onIntersectionEnter={(payload) => {
                        if (payload.other.rigidBodyObject?.name === 'player') {
                            onPickup()
                        }
                    }}
                >
                    <CuboidCollider args={[0.5, 0.5, 0.5]} />

                    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                        <group ref={meshRef}>
                            {/* Visuals */}
                            <mesh castShadow>
                                <boxGeometry args={[0.3, 0.3, 0.3]} />
                                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
                            </mesh>
                            {/* Key shape details */}
                            <mesh position={[0, 0.2, 0]}>
                                <torusGeometry args={[0.1, 0.02, 16, 32]} />
                                <meshStandardMaterial color="#FFD700" />
                            </mesh>

                            {/* Label */}
                            <Text
                                position={[0, 0.5, 0]}
                                fontSize={0.2}
                                color="white"
                                anchorX="center"
                                anchorY="middle"
                            >
                                {label}
                            </Text>
                        </group>
                    </Float>
                </RigidBody>
            )}
        </GameEntity>
    )
}

export default Pickup
