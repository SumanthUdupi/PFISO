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
    // PERF-046: Memory Fragmentation - Pre-allocate vectors
    const currentPos = useRef(new THREE.Vector3())
    const targetVec = useRef(new THREE.Vector3())
    const dir = useRef(new THREE.Vector3())
    const vel = useRef(new THREE.Vector3())

    // Keep track of position for death location
    const lastPos = useRef<THREE.Vector3>(new THREE.Vector3(...startPosition))

    useFrame((stateCtx, delta) => {
        if (!rigidBodyRef.current) return

        if (rigidBodyRef.current && !isDead) {
            const t = rigidBodyRef.current.translation()
            lastPos.current.set(t.x, t.y, t.z)
            currentPos.current.set(t.x, t.y, t.z)
        }

        timer.current -= delta

        // HEAD TRACKING logic
        const playerPos = gameSystemInstance.playerPosition
        const distToPlayer = Math.sqrt(
            Math.pow(currentPos.current.x - playerPos.x, 2) +
            Math.pow(currentPos.current.z - playerPos.z, 2)
        )
        if (distToPlayer < 8.0) {
            // New Vector3 here is okay as it's passed to prop? Ideally prop handles it or we pass x,y,z
            // But look at logic: setLookTarget state update. State updates trigger re-render anyway.
            // We can compare before setting to avoid unnecessary state updates if strictly equal?
            // Vector3 equality check?
            // For now, let's just leave state update as is, but optimize the calculation vectors above.
            setLookTarget(new THREE.Vector3(playerPos.x, playerPos.y + 1.5, playerPos.z))
        } else {
            if (lookTarget !== undefined) setLookTarget(undefined)
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
                        target = targetVec.current.set(p[0], p[1], p[2])
                        patrolPointIndex.current++
                    }
                }

                if (!target) {
                    // Fallback to random wander
                    const rnd = navigationSystem.getRandomPoint()
                    if (rnd) target = targetVec.current.copy(rnd)
                }

                if (target) {
                    const newPath = navigationSystem.findPath(currentPos.current, target)
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
            targetVec.current.set(targetParams.x, targetParams.y, targetParams.z)

            const dist = new THREE.Vector2(targetVec.current.x - currentPos.current.x, targetVec.current.z - currentPos.current.z).length()

            if (dist < 0.5) {
                // Reached node
                targetNodeIndex.current++
            }

            // Move towards target
            dir.current.copy(targetVec.current).sub(currentPos.current).normalize()
            vel.current.copy(dir.current).multiplyScalar(speed)

            // Apply velocity
            rigidBodyRef.current.setLinvel({ x: vel.current.x, y: -1, z: vel.current.z }, true) // -1 gravity
            currentVelocity.current.copy(vel.current)

            // Rotate
            if (groupRef.current) {
                const angle = Math.atan2(dir.current.x, dir.current.z)
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
            colliders={false} // CL-006: Use explicit collider
            enabledRotations={[false, false, false]}
            friction={0.5}
            ccd={true} // CL-006: Prevent tunneling/interpenetration
        >
            <CapsuleCollider args={[0.3, 0.8]} position={[0, 0.8, 0]} /> {/* 0.3 radius, 0.8 half-height */}
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
