import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import RobloxCharacter from '../RobloxCharacter'
import navigationSystem from '../../../systems/NavigationSystem'
import gameSystemInstance from '../../../systems/GameSystem'
import useGameStore from '../../../store'
import RagdollCharacter from '../RagdollCharacter'

interface CrowdAgentProps {
    id: number
    startPosition: [number, number, number]
    color?: string
    patrolPathId?: string
}

type AgentState = 'IDLE' | 'WALK'

export const CrowdAgent: React.FC<CrowdAgentProps> = ({ id, startPosition, color = '#ffeb3b', patrolPathId }) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const [state, setState] = useState<AgentState>('IDLE')
    const [path, setPath] = useState<THREE.Vector3[]>([])
    const [isDead, setIsDead] = useState(false) // Death state
    const targetNodeIndex = useRef(0)
    const patrolPointIndex = useRef(0)
    const [lookTarget, setLookTarget] = useState<THREE.Vector3 | undefined>(undefined)

    // State timers
    const timer = useRef(Math.random() * 2) // Random start offset

    // Movement vars
    const speed = 2.0
    const currentVelocity = useRef(new THREE.Vector3())
    const groupRef = useRef<THREE.Group>(null)

    // Keep track of position for death location
    const lastPos = useRef<THREE.Vector3>(new THREE.Vector3(...startPosition))

    useFrame((stateCtx, delta) => {
        if (!rigidBodyRef.current) return

        if (rigidBodyRef.current && !isDead) {
            const t = rigidBodyRef.current.translation()
            lastPos.current.set(t.x, t.y, t.z)
        }

        timer.current -= delta

        const pos = rigidBodyRef.current.translation()
        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z)

        // HEAD TRACKING logic
        const playerPos = gameSystemInstance.playerPosition
        const distToPlayer = Math.sqrt(
            Math.pow(pos.x - playerPos.x, 2) +
            Math.pow(pos.z - playerPos.z, 2)
        )
        if (distToPlayer < 8.0) {
            setLookTarget(new THREE.Vector3(playerPos.x, playerPos.y + 1.5, playerPos.z))
        } else {
            setLookTarget(undefined)
        }

        if (state === 'IDLE') {
            currentVelocity.current.set(0, 0, 0)

            if (timer.current <= 0) {
                // Determine Target
                let target: THREE.Vector3 | null = null

                if (patrolPathId) {
                    const paths = useGameStore.getState().patrolPaths
                    const patrolPath = paths[patrolPathId]
                    if (patrolPath && patrolPath.points.length > 0) {
                        // Get next point
                        const p = patrolPath.points[patrolPointIndex.current % patrolPath.points.length]
                        target = new THREE.Vector3(p[0], p[1], p[2])
                        patrolPointIndex.current++
                    }
                }

                if (!target) {
                    // Fallback to random wander
                    target = navigationSystem.getRandomPoint()
                }

                if (target) {
                    const newPath = navigationSystem.findPath(currentPos, target)
                    if (newPath && newPath.length > 0) {
                        setPath(newPath)
                        targetNodeIndex.current = 0
                        setState('WALK')
                        timer.current = 10 // Max walk time timeout
                    } else {
                        timer.current = 1 + Math.random() * 2
                    }
                } else {
                    timer.current = 1 + Math.random() * 2
                }
            }
        }
        else if (state === 'WALK') {
            if (path.length === 0 || targetNodeIndex.current >= path.length) {
                setState('IDLE')
                timer.current = 2 + Math.random() * 3
                return
            }

            const targetParams = path[targetNodeIndex.current]
            const target = new THREE.Vector3(targetParams.x, targetParams.y, targetParams.z)

            const dist = new THREE.Vector2(target.x - currentPos.x, target.z - currentPos.z).length()

            if (dist < 0.5) {
                // Reached node
                targetNodeIndex.current++
            }

            // Move towards target
            const dir = target.clone().sub(currentPos).normalize()
            const vel = dir.multiplyScalar(speed)

            // Apply velocity
            rigidBodyRef.current.setLinvel({ x: vel.x, y: -1, z: vel.z }, true) // -1 gravity
            currentVelocity.current.copy(vel)

            // Rotate
            if (groupRef.current) {
                const angle = Math.atan2(dir.x, dir.z)
                // Smooth rotation
                const rot = groupRef.current.rotation.y
                // Simple lerp angle
                groupRef.current.rotation.y = THREE.MathUtils.lerp(rot, angle, delta * 5)
            }

            // Timeout check
            if (timer.current <= 0) {
                setState('IDLE')
                timer.current = 2
            }
        }

        // Apply visual rotation if we want independent rotation from body? 
        // We are rotating groupRef.
    })

    const handleInteraction = (e: any) => {
        // Simple click to kill for testing
        e.stopPropagation()
        setIsDead(true)
    }

    if (isDead) {
        // Render Ragdoll at current position (approximate)
        // We lose the exact position if rigidBody is unmounted immediately, 
        // so we need to capture it BEFORE switching? 
        // Actually, React state update will trigger re-render. 
        // We can trust the last known position or capture it in a Ref.
        // For simplicity, we'll assume `startPosition` or track it.
        // Wait, startPosition is static. 
        // We need a ref to store the last position.

        // Actually, we can just use a separate PositionTracker or return the Ragdoll 
        // at the ref's last known translation.
        // Better Pattern: Just switch the content but keep a wrapper? 
        // No, RigidBody physics type change is hard.
        // We'll capture position in state before setting isDead?
        // Let's rely on a ref for now.
        return (
            <RagdollCharacter
                position={[lastPos.current.x, lastPos.current.y, lastPos.current.z]}
                shirtColor={color}
            />
        )
    }

    return (
        <RigidBody
            ref={rigidBodyRef}
            position={startPosition}
            colliders="hull"
            enabledRotations={[false, false, false]}
            friction={0.5}
        >
            <group ref={groupRef} onClick={handleInteraction}>
                <RobloxCharacter
                    isMoving={state === 'WALK'}
                    speed={speed}
                    shirtColor={color}
                    pantsColor="#333"
                    lookTarget={lookTarget}
                />
            </group>
        </RigidBody>
    )
}
