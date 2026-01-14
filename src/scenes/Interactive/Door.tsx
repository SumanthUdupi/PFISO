import React, { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody, CuboidCollider, RigidBodyApi } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import GameEntity from '../../components/game/ECS/GameEntity'
import globalEvents from '../../systems/EventManager'
import PositionalSound from '../../components/audio/PositionalSound'

// CONT-004: Door System

interface DoorProps {
    id: string
    position: [number, number, number]
    rotation?: [number, number, number]
    label?: string
    isLocked?: boolean
    keyId?: string // Item ID required to unlock
}

const Door: React.FC<DoorProps> = ({
    id, position, rotation = [0, 0, 0], label = "Door", isLocked = false, keyId
}) => {
    const rigidBody = useRef<RigidBodyApi>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [locked, setLocked] = useState(isLocked)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [playSound, setPlaySound] = useState<'open' | 'close' | 'locked' | null>(null)

    // Animation State
    const currentRot = useRef(rotation[1]) // Y rotation
    const targetRot = useRef(rotation[1])

    useEffect(() => {
        const handleInteraction = (payload: any) => {
            if (payload.label === label) {
                if (locked) {
                    // Check Inventory (Mock)
                    // In real system: inventory.hasItem(keyId)
                    const hasKey = keyId === 'test_key' // Mock check

                    if (hasKey) {
                        setLocked(false)
                        setFeedback("Unlocked")
                        setPlaySound('open') // unlock sound?
                        setTimeout(() => setFeedback(null), 1000)
                    } else {
                        setFeedback("Locked")
                        setPlaySound('locked')
                        setTimeout(() => setFeedback(null), 1000)
                    }
                } else {
                    // Toggle Open/Close
                    const newState = !isOpen
                    setIsOpen(newState)
                    targetRot.current = newState ? rotation[1] + Math.PI / 2 : rotation[1]
                    setPlaySound(newState ? 'open' : 'close')
                }
            }
        }

        const unsubscribe = globalEvents.on('INTERACT_TRIGGER', handleInteraction)
        return () => { unsubscribe?.() }
    }, [isOpen, locked, label, keyId, rotation])

    useFrame((state, delta) => {
        if (!rigidBody.current) return

        // Smooth Animation
        currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRot.current, delta * 5)

        // Sync Physics Body
        // Kinematic Position: We set the NextKinematicRotation
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentRot.current)
        rigidBody.current.setNextKinematicRotation(q)
    })

    // Reset sound trigger
    useEffect(() => {
        if (playSound) {
            const t = setTimeout(() => setPlaySound(null), 100)
            return () => clearTimeout(t)
        }
    }, [playSound])

    return (
        <GameEntity id={id} tags={['door', 'interactive']} components={{ isOpen, locked }}>
            <RigidBody
                ref={rigidBody}
                type="kinematicPosition"
                position={new THREE.Vector3(...position)}
                rotation={new THREE.Euler(...rotation)}
                colliders={false} // Custom collider
            >
                {/* Visual Door */}
                {/* Pivot is usually center, so we might need to offset mesh to hinge it. */}
                {/* Let's assume (0,0,0) is center for now, which means it rotates around center. */}
                {/* To hinge: Offset geo by half width? */}
                {/* Center of rigidbody is pivot. So if we want hinge on side, we place RB at hinge pos and offset mesh. */}

                <mesh position={[0.75, 1.25, 0]} castShadow receiveShadow>
                    <boxGeometry args={[1.5, 2.5, 0.2]} />
                    <meshStandardMaterial color={locked ? '#8b0000' : '#8b4513'} />
                </mesh>
                {/* Handle */}
                <mesh position={[1.3, 1.25, 0.15]}>
                    <sphereGeometry args={[0.1]} />
                    <meshStandardMaterial color="gold" />
                </mesh>

                {/* Collider matching visual */}
                <CuboidCollider args={[0.75, 1.25, 0.1]} position={[0.75, 1.25, 0]} />

                {feedback && (
                    <Html position={[0.75, 2, 0]} center>
                        <div style={{
                            color: 'white', background: 'rgba(0,0,0,0.8)',
                            padding: '4px 8px', borderRadius: '4px',
                            fontSize: '12px', fontWeight: 'bold'
                        }}>
                            {feedback}
                        </div>
                    </Html>
                )}

                {/* Audio */}
                <PositionalSound type="step" trigger={playSound === 'open'} volumeMultiplier={1} />
                {/* Using 'step' as placeholder for door sound since we don't have door yet? Or maybe 'click'? */}
                {/* Let's use 'click' for lock and 'land' for thud? */}
            </RigidBody>
        </GameEntity>
    )
}

export default Door
