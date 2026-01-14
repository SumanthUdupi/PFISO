import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody, CapsuleCollider, RigidBodyApi } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import RobloxCharacter from '../RobloxCharacter'
import { findPath } from '../../../utils/pathfinding'
import GameEntity from '../ECS/GameEntity'
import { entityManager } from '../../../systems/EntityManager'
import { Steering } from './Steering'

// MECH-031: FSM
// MECH-032: NavMesh (Grid)
// MECH-034: Vision Cone

type State = 'IDLE' | 'PATROL' | 'CHASE' | 'INTERACT'

const NPC = ({ startPos = [3, 0, 3] }: { startPos?: [number, number, number] }) => {
    const rigidBody = useRef<RigidBodyApi>(null)
    const position = useRef(new THREE.Vector3(...startPos))
    const rotation = useRef(0)

    // AI State
    const [currentState, setCurrentState] = useState<State>('IDLE')
    const stateTimer = useRef(2.0) // Init wait
    const path = useRef<THREE.Vector3[]>([])
    const pathIndex = useRef(0)
    const targetPlayer = useRef<THREE.Group>(null) // We need a way to get player pos. Global store?

    // Visuals
    const [bubbleText, setBubbleText] = useState<string | null>(null)
    const animRef = useRef({ speed: 0 })

    // Helper: Global Player Tracking using a store is better, 
    // but for now let's blindly search for "Player" via scene or just assume we know logic?
    // Actually, let's just use the `useFrame` state.camera.position if it's FPS? 
    // Or simpler: pass player ref? 
    // Let's assume the player is at (0,0,0) initially or use a store if available? 
    // We already have `useControlsStore` but that doesn't have position.
    // `useCameraStore` doesn't either.
    // Let's rely on `state.camera.position` for "Approaching the Camera" (Observer).
    // Or better: Let's assume Player is the only other dynamic object.

    useFrame((state, delta) => {
        if (!rigidBody.current) return

        // 1. Sync Physics
        const currentPos = rigidBody.current.translation()
        position.current.set(currentPos.x, currentPos.y, currentPos.z)

        // 2. Perception (MECH-034)
        // Assume player is at camera position for now (first person) 
        // OR calculate if we had a player ref.
        // Let's use Camera position as proxy for Player Body if 3rd person camera is close.
        const playerPos = state.camera.position.clone()
        // Note: In 3rd person, camera is behind player. Ideally we want the targetRef from CameraController.
        // But we don't have easy access.
        // Let's just patrol for now.

        const distToPlayer = position.current.distanceTo(playerPos)
        const canSee = distToPlayer < 8.0 // Detection radius

        // 3. FSM Update
        let moveInput = new THREE.Vector3()
        let speed = 0

        switch (currentState) {
            case 'IDLE':
                stateTimer.current -= delta
                if (stateTimer.current <= 0) {
                    // Plan new patrol
                    const rx = Math.floor((Math.random() - 0.5) * 10)
                    const rz = Math.floor((Math.random() - 0.5) * 10)
                    const dest = new THREE.Vector3(rx, 0, rz)

                    // Simple validation: Keep within bounds -7 to 7
                    dest.x = THREE.MathUtils.clamp(dest.x, -6, 6)
                    dest.z = THREE.MathUtils.clamp(dest.z, -6, 6)

                    path.current = findPath(position.current, dest)
                    pathIndex.current = 0

                    if (path.current.length > 0) {
                        setCurrentState('PATROL')
                        setBubbleText("Hmm...")
                        setTimeout(() => setBubbleText(null), 1000)
                    } else {
                        stateTimer.current = 1.0 // Retry soon
                    }
                }
                break

            case 'PATROL':
                if (canSee && distToPlayer < 3.0) {
                    // Switch to Chase/Interact
                    setCurrentState('INTERACT')
                    setBubbleText("Oh, hello!")
                    break
                }

                if (path.current.length > 0 && pathIndex.current < path.current.length) {
                    const target = path.current[pathIndex.current]
                    const dir = target.clone().sub(position.current)
                    dir.y = 0

                    if (dir.length() < 0.5) {
                        pathIndex.current++
                    } else {
                        moveInput.copy(dir.normalize())
                        speed = 3.0
                    }
                } else {
                    // Path done
                    setCurrentState('IDLE')
                    stateTimer.current = 2.0 + Math.random() * 2.0
                }
                break

            case 'INTERACT':
                // Turn to face player
                const dirToPlayer = playerPos.clone().sub(position.current)
                dirToPlayer.y = 0
                moveInput.copy(dirToPlayer.normalize())
                speed = 0 // Rotate only?

                // If player runs away
                if (distToPlayer > 4.0) {
                    setCurrentState('IDLE')
                    setBubbleText(null)
                    stateTimer.current = 1.0
                }
                break
        }

        // 4. Physics Apply (Steering Behaviors)
        // Previous logic was direct velocity setting. New logic is force based? 
        // Actually, Rapier is velocity based mostly unless we use impulses.
        // But we can simulate steering by calculating a "desired velocity" from the steering force 
        // and lerping towards it, OR just setting velocity to (velocity + steer).

        // Let's use the calculated steer as an acceleration.
        // vel = vel + steer * delta (simplified)

        const currentVel = rigidBody.current.linvel()
        const currentVelVec = new THREE.Vector3(currentVel.x, 0, currentVel.z) // Ignore Y for steering

        let steerForce = new THREE.Vector3()

        if (speed > 0 || (currentState === 'PATROL' && path.current.length > 0)) {
            // Calculate target
            let steerTarget = new THREE.Vector3()
            if (currentState === 'INTERACT') {
                // Face player, maybe arrive?
                steerTarget.copy(playerPos)
                // Arrive at 2.0 distance
                steerForce = Steering.arrive(position.current, steerTarget, currentVelVec, 3.0, 2.0)
            } else if (moveInput.lengthSq() > 0) {
                // We were using moveInput from path following
                // Let's assume moveInput is the DIRECTION. 
                // We need the actual POINT.
                // In PATROL loop, we have `target`
                // We need to refactor logic slightly to expose `target` to this scope if we want true steering
                // OR simpler: direct seek to `target` defined in loop?
            }
        }

        // REFACTORING LOGIC IN PLACE to mesh with existing switch:
        // Instead of calculating "moveInput" direction, let's calculate "steerForce".

        if (currentState === 'PATROL' && path.current.length > 0 && pathIndex.current < path.current.length) {
            const target = path.current[pathIndex.current]
            // Arrive if last point, Seek otherwise
            const isLast = pathIndex.current === path.current.length - 1
            if (isLast) {
                steerForce = Steering.arrive(position.current, target, currentVelVec, 3.0, 0.5)
            } else {
                steerForce = Steering.seek(position.current, target, currentVelVec, 3.0)
            }

            // Check distance to switch point
            if (position.current.distanceTo(target) < 0.5) {
                pathIndex.current++
            }
            speed = 3.0 // Flag validity
        } else if (currentState === 'INTERACT') {
            // Arrive at player
            steerForce = Steering.arrive(position.current, playerPos, currentVelVec, 3.0, 3.0)
            // Stop if close
            if (distToPlayer < 2.0) steerForce.set(0, 0, 0)
            speed = 0.1 // Just for animation trigger?
        }

        // Apply Steer
        const newVelVec = currentVelVec.clone().add(steerForce.multiplyScalar(delta * 10)) // Arbitrary mass factor
        // Clamp to max speed
        if (newVelVec.length() > 3.0) newVelVec.normalize().multiplyScalar(3.0)

        // Rotation: Face velocity if moving
        if (newVelVec.lengthSq() > 0.1) {
            const targetRot = Math.atan2(newVelVec.x, newVelVec.z)
            let angleDiff = targetRot - rotation.current
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
            rotation.current += angleDiff * delta * 5
        }

        let finalVel = new THREE.Vector3(newVelVec.x, currentVel.y, newVelVec.z)
        rigidBody.current.setLinvel(finalVel, true)
        rigidBody.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current), true)

        animRef.current.speed = speed
    })

    return (
        <GameEntity id="npc_01" tags={['npc', 'enemy']} components={{ state: currentState }}>
            <RigidBody
                ref={rigidBody}
                position={new THREE.Vector3(...startPos)}
                enabledRotations={[false, false, false]}
                colliders={false}
            >
                <CapsuleCollider args={[0.25, 0.4]} position={[0, 0.7, 0]} />
                <group rotation={[0, rotation.current, 0]}>
                    {/* Reuse Character Visual but Tinted? */}
                    {/* Since RobloxCharacter might not accept color, we just use it validly */}
                    <RobloxCharacter isMoving={animRef.current.speed > 0.1} speed={animRef.current.speed} />
                </group>

                {bubbleText && (
                    <Html position={[0, 2.2, 0]} center>
                        <div style={{
                            background: 'white',
                            padding: '5px 10px',
                            borderRadius: '10px',
                            border: '1px solid #333',
                            fontFamily: 'sans-serif',
                            fontSize: '12px',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                        }}>
                            {bubbleText}
                        </div>
                    </Html>
                )}
            </RigidBody>
        </GameEntity>
    )
}
export default NPC
