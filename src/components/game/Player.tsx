import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import TeleportSparkle from './TeleportSparkle'

// Constants for physics and animation
const SPEED = 5
const ACCELERATION = 20
const FRICTION = 10
const ROTATION_SPEED = 15
const HEAD_TRACKING_LIMIT = Math.PI / 4 // 45 degrees
const BORED_TIMEOUT = 10000 // 10 seconds
const JUMP_FORCE = 8
const GRAVITY = 20

// Particle System for Dust
const DustParticles = ({ position, isMoving }: { position: THREE.Vector3, isMoving: boolean }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3 }[]>([])
    const group = useRef<THREE.Group>(null)
    const geometry = useMemo(() => new THREE.CircleGeometry(0.05, 8), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.6 }), [])

    useFrame((state, delta) => {
        if (!group.current) return

        // Spawn particles
        if (isMoving && Math.random() < 0.2) { // Adjust spawn rate
            const mesh = new THREE.Mesh(geometry, material.clone())
            mesh.rotation.x = -Math.PI / 2
            mesh.position.set(position.x + (Math.random() - 0.5) * 0.4, 0.05, position.z + (Math.random() - 0.5) * 0.4)
            group.current.add(mesh)
            particles.current.push({
                mesh,
                life: 1.0,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.5, (Math.random() - 0.5) * 0.5)
            })
        }

        // Update particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 2 // Fade speed
            p.mesh.position.addScaledVector(p.velocity, delta)
            p.mesh.scale.setScalar(p.life)
            // @ts-ignore
            p.mesh.material.opacity = p.life * 0.6

            if (p.life <= 0) {
                group.current.remove(p.mesh)
                p.mesh.geometry.dispose() // Optional if sharing geometry but safe practice
                // @ts-ignore
                p.mesh.material.dispose()
                particles.current.splice(i, 1)
            }
        }
    })

    return <group ref={group} />
}


export interface PlayerHandle {
    triggerInteraction: (label: string) => void
}

interface PlayerProps {
    onPositionChange?: (pos: THREE.Vector3) => void
    initialPosition?: [number, number, number]
}

const Player = React.forwardRef<PlayerHandle, PlayerProps>(({ onPositionChange, initialPosition = [0, 0.5, 0] }, ref) => {
    const mesh = useRef<THREE.Group>(null)

    // Mesh parts refs for animation
    const bodyMesh = useRef<THREE.Mesh>(null)
    const headMesh = useRef<THREE.Mesh>(null)
    const shadowMesh = useRef<THREE.Mesh>(null)
    const rightArm = useRef<THREE.Mesh>(null)
    const leftArm = useRef<THREE.Mesh>(null)

    // Physics state
    const velocity = useRef(new THREE.Vector3(0, 0, 0))
    const verticalVelocity = useRef(0)
    const currentPosition = useRef(new THREE.Vector3(...initialPosition))
    const targetRotation = useRef(0)

    // Input state
    const keys = useRef<{ [key: string]: boolean }>({})
    const lastInputTime = useRef(Date.now())
    const [isBored, setIsBored] = useState(false)
    const isMoving = useRef(false)
    const isJumping = useRef(false)

    // Interaction State
    const [interactionLabel, setInteractionLabel] = useState<string | null>(null)
    const interactionTimer = useRef<number>(0)

    // AN-02: Speed Trails
    // We use imperative rendering via a group and manual mesh management for performance and to avoid React render cycle latency
    const trailsGroup = useRef<THREE.Group>(null)
    const trailsRef = useRef<{ mesh: THREE.Mesh, life: number }[]>([])

    // AN-01: Teleport Sparkle trigger
    const [sparkleTrigger, setSparkleTrigger] = useState(false)

    useImperativeHandle(ref, () => ({
        triggerInteraction: (label: string) => {
            setInteractionLabel(label)
            interactionTimer.current = 1.5 // Duration of "Got Item" pose
            // Reset velocities
            velocity.current.set(0, 0, 0)
            isMoving.current = false
            // Trigger sparkle
            setSparkleTrigger(true)
        }
    }))

    // Setup Input Listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key] = true
            // Space for Jump
            if (e.code === 'Space' && !isJumping.current && interactionTimer.current <= 0) {
                verticalVelocity.current = JUMP_FORCE
                isJumping.current = true
            }
            lastInputTime.current = Date.now()
            setIsBored(false)
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key] = false
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useFrame((state, delta) => {
        if (!mesh.current) return

        // Handle Interaction Timer
        if (interactionTimer.current > 0) {
            interactionTimer.current -= delta
            if (interactionTimer.current <= 0) {
                setInteractionLabel(null)
            }
            // "Got Item" Pose Logic
            if (bodyMesh.current && rightArm.current && leftArm.current) {
                mesh.current.position.y = 0.5 // Reset height
                bodyMesh.current.scale.set(1, 1, 1)
                mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, Math.PI, 0.1) // Face Camera (approx)

                // Arms up
                rightArm.current.position.set(0.25, 0.6, 0)
                rightArm.current.rotation.z = Math.PI - 0.5
                leftArm.current.position.set(-0.25, 0.6, 0)
                leftArm.current.rotation.z = -(Math.PI - 0.5)
            }
            return // Skip movement during interaction
        } else {
             // Reset Arms
             if (rightArm.current) {
                 rightArm.current.position.set(0.25, 0.4, 0)
                 rightArm.current.rotation.z = 0
             }
             if (leftArm.current) {
                 leftArm.current.position.set(-0.25, 0.4, 0)
                 leftArm.current.rotation.z = 0
             }
        }

        // --- Boredom Check ---
        if (!isMoving.current && !isJumping.current && Date.now() - lastInputTime.current > BORED_TIMEOUT) {
            if (!isBored) setIsBored(true)
        }

        // --- Movement Logic ---
        const inputVector = new THREE.Vector3(0, 0, 0)
        if (keys.current['w'] || keys.current['ArrowUp']) inputVector.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) inputVector.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) inputVector.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) inputVector.x += 1

        if (inputVector.length() > 0) {
            inputVector.normalize()
            isMoving.current = true
            lastInputTime.current = Date.now()
            setIsBored(false)
        } else {
            isMoving.current = false
        }

        // Acceleration
        if (isMoving.current) {
            velocity.current.addScaledVector(inputVector, ACCELERATION * delta)
        }

        // Cap speed
        if (velocity.current.length() > SPEED) {
            velocity.current.setLength(SPEED)
        }

        // Friction
        const frictionForce = velocity.current.clone().multiplyScalar(-1).normalize().multiplyScalar(FRICTION * delta)
        if (velocity.current.length() < frictionForce.length()) {
            velocity.current.set(0, 0, 0)
        } else {
            velocity.current.add(frictionForce)
        }

        // Apply Horizontal Velocity
        currentPosition.current.addScaledVector(velocity.current, delta)

        // --- Vertical Physics (Jump) ---
        verticalVelocity.current -= GRAVITY * delta
        let currentY = mesh.current.position.y + verticalVelocity.current * delta

        // Floor Collision
        if (currentY <= 0.5) {
            currentY = 0.5
            verticalVelocity.current = 0
            isJumping.current = false
        } else {
            isJumping.current = true
        }

        mesh.current.position.set(currentPosition.current.x, currentY, currentPosition.current.z)

        // Update Trails (AN-02)
        if (trailsGroup.current) {
            // Spawn new trail segment
            if (isMoving.current && state.clock.getElapsedTime() % 0.1 < delta) {
                const trailMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.6, 0.3),
                    new THREE.MeshBasicMaterial({ color: "#E74C3C", transparent: true, opacity: 0.5 })
                )
                trailMesh.position.copy(mesh.current.position)
                trailMesh.rotation.copy(mesh.current.rotation)
                trailsGroup.current.add(trailMesh)
                trailsRef.current.push({ mesh: trailMesh, life: 1.0 })
            }

            // Update existing trails
            for (let i = trailsRef.current.length - 1; i >= 0; i--) {
                const trail = trailsRef.current[i]
                trail.life -= delta * 3 // Fade out speed
                trail.mesh.material.opacity = trail.life * 0.5

                if (trail.life <= 0) {
                    trailsGroup.current.remove(trail.mesh)
                    trail.mesh.geometry.dispose()
                    trail.mesh.material.dispose()
                    trailsRef.current.splice(i, 1)
                }
            }
        }

        // Notify parent
        if (onPositionChange) onPositionChange(currentPosition.current)

        // --- Rotation (8-way) ---
        if (inputVector.lengthSq() > 0.01) {
            targetRotation.current = Math.atan2(inputVector.x, inputVector.z)
        }

        // Smooth Rotation
        let rotDiff = targetRotation.current - mesh.current.rotation.y
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
        mesh.current.rotation.y += rotDiff * ROTATION_SPEED * delta

        // --- Head Tracking ---
        if (headMesh.current) {
            const mouse = state.pointer
            const targetHeadY = -mouse.x * HEAD_TRACKING_LIMIT
            const targetHeadX = -mouse.y * HEAD_TRACKING_LIMIT
            headMesh.current.rotation.y = THREE.MathUtils.lerp(headMesh.current.rotation.y, targetHeadY, 0.1)
            headMesh.current.rotation.x = THREE.MathUtils.lerp(headMesh.current.rotation.x, targetHeadX, 0.1)
        }

        // --- Squash & Stretch / Bobbing ---
        const walkCycle = Math.sin(state.clock.elapsedTime * 15)
        const idleCycle = Math.sin(state.clock.elapsedTime * 2)

        if (bodyMesh.current) {
            if (isJumping.current) {
                // Stretch in air
                 const verticalFactor = Math.min(1.5, 1 + Math.abs(verticalVelocity.current) * 0.05)
                 bodyMesh.current.scale.set(1/verticalFactor, verticalFactor, 1/verticalFactor)
            } else if (isMoving.current) {
                // Bobbing while walking
                // mesh.current.position.y += Math.abs(walkCycle) * 0.1 // Conflict with physics
                // Visual bob only via scale or mesh offset (not group)
                bodyMesh.current.position.y = 0.4 + Math.abs(walkCycle) * 0.05

                const scaleY = 1 + walkCycle * 0.1
                const scaleXZ = 1 - walkCycle * 0.05
                bodyMesh.current.scale.set(scaleXZ, scaleY, scaleXZ)
            } else if (isBored) {
                 bodyMesh.current.position.y = 0.4 + idleCycle * 0.02
                 bodyMesh.current.scale.set(1, 1, 1)
                 mesh.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05
            } else {
                // Idle breathing
                bodyMesh.current.position.y = 0.4 + idleCycle * 0.02
                const breathe = 1 + idleCycle * 0.02
                bodyMesh.current.scale.set(1, breathe, 1)
                mesh.current.rotation.z = 0
            }
        }

        // --- Shadow Dynamics ---
        if (shadowMesh.current) {
             const height = mesh.current.position.y - 0.5
             const shadowScale = 1 - height * 0.5
             shadowMesh.current.scale.setScalar(Math.max(0.1, shadowScale))
             // @ts-ignore
             shadowMesh.current.material.opacity = Math.max(0, 0.3 - height * 0.5)
        }

    })

    return (
        <>
            <TeleportSparkle
                position={mesh.current ? mesh.current.position : new THREE.Vector3(...initialPosition)}
                trigger={sparkleTrigger}
                onComplete={() => setSparkleTrigger(false)}
            />

            {/* AN-02: Speed Trails Container */}
            <group ref={trailsGroup} />

            <group ref={mesh} position={initialPosition}>
                {/* Got Item Icon */}
                {interactionLabel && (
                     <Html position={[0, 2, 0]} center>
                         <div style={{
                             fontFamily: '"Press Start 2P", cursive',
                             color: 'white',
                             background: 'rgba(0,0,0,0.7)',
                             padding: '5px',
                             borderRadius: '5px',
                             textAlign: 'center',
                             border: '2px solid white'
                         }}>
                             <div style={{fontSize: '24px', marginBottom: '5px'}}>★</div>
                             <div style={{fontSize: '10px'}}>{interactionLabel}</div>
                         </div>
                     </Html>
                )}

                {/* Body */}
                <mesh ref={bodyMesh} castShadow position={[0, 0.4, 0]}>
                    <boxGeometry args={[0.4, 0.6, 0.3]} />
                    <meshStandardMaterial color="#E74C3C" />
                </mesh>

                {/* Arms */}
                <mesh ref={rightArm} position={[0.25, 0.4, 0]} castShadow>
                     <boxGeometry args={[0.1, 0.4, 0.1]} />
                     <meshStandardMaterial color="#C0392B" />
                </mesh>
                <mesh ref={leftArm} position={[-0.25, 0.4, 0]} castShadow>
                     <boxGeometry args={[0.1, 0.4, 0.1]} />
                     <meshStandardMaterial color="#C0392B" />
                </mesh>


                {/* Head */}
                <group position={[0, 0.9, 0]}>
                     <mesh ref={headMesh} castShadow>
                        <boxGeometry args={[0.3, 0.3, 0.3]} />
                        <meshStandardMaterial color="#F1C40F" />
                        {/* Eyes */}
                        <mesh position={[0, 0.05, -0.16]}>
                             <boxGeometry args={[0.05, 0.05, 0.05]} />
                             <meshStandardMaterial color="black" />
                        </mesh>
                        <mesh position={[0.1, 0.05, -0.16]}>
                             <boxGeometry args={[0.05, 0.05, 0.05]} />
                             <meshStandardMaterial color="black" />
                        </mesh>
                     </mesh>
                </group>

                {/* Shadow Blob */}
                <mesh ref={shadowMesh} position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.3, 16]} />
                    <meshBasicMaterial color="black" transparent opacity={0.3} />
                </mesh>
            </group>

            <DustParticles position={currentPosition.current} isMoving={isMoving.current && !isJumping.current} />
        </>
    )
})

export default Player
