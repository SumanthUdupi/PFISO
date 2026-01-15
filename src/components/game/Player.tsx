import React, { useRef, useEffect, useState, useMemo, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, CameraShake, ContactShadows } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier, RigidBodyApi, RapierRigidBody } from '@react-three/rapier'
import TeleportSparkle from './TeleportSparkle'
import RobloxCharacter from './RobloxCharacter'
import { findPath } from '../../utils/pathfinding'
import useAudioStore from '../../audioStore'
import useControlsStore from '../../stores/controlsStore'
import useCameraStore from '../../stores/cameraStore'
import gameSystemInstance from '../../systems/GameSystem'

// --- TUNING CONSTANTS ---
// MECH-FIX: Tuned for non-lerp physics (units/sec^2)
const MOVE_SPEED = 6
const ACCELERATION_GROUND = 35.0 // Snappy start
const ACCELERATION_AIR = 10.0   // Lower air control
const FRICTION_GROUND = 25.0    // Quick stops
const FRICTION_AIR = 2.0        // Low drag in air
const JUMP_FORCE = 13.0         // Slightly higher to compensate for gravity
const ROTATION_SPEED = 18.0     // Schnappy turning

// Game Feel
const COYOTE_TIME = 0.15
const JUMP_BUFFER = 0.15
const JUMP_CUT_HEIGHT = 0.6
const TILT_AMOUNT = 0.08
const BANK_AMOUNT = 0.08

// --- HELPER: Spring Physics for Squash/Stretch ---
class Spring {
    val: number = 1
    target: number = 1
    vel: number = 0
    stiffness: number
    damping: number

    constructor(stiffness = 200, damping = 15) {
        this.stiffness = stiffness
        this.damping = damping
    }

    update(dt: number) {
        const force = (this.target - this.val) * this.stiffness
        this.vel += force * dt
        this.vel *= Math.max(0, 1 - this.damping * dt)
        this.val += this.vel * dt
    }

    impulse(force: number) {
        this.vel += force
    }
}

// --- PARTICLES: Directional Dust ---
const VoxelDust = ({ position, velocity, isGrounded }: { position: THREE.Vector3, velocity: THREE.Vector3, isGrounded: boolean }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3, rotSpeed: THREE.Vector3 }[]>([])
    const group = useRef<THREE.Group>(null)
    const geometry = useMemo(() => new THREE.BoxGeometry(0.06, 0.06, 0.06), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#dddddd', transparent: true }), [])

    useFrame((state, delta) => {
        if (!group.current) return
        const speed = new THREE.Vector3(velocity.x, 0, velocity.z).length()
        // MECH-FIX: Tune dust threshold
        if (isGrounded && speed > 4 && Math.random() < 0.3) {
            const mesh = new THREE.Mesh(geometry, material.clone())
            const kickDir = velocity.clone().normalize().negate().multiplyScalar(0.2)
            const spread = new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3)
            mesh.position.copy(position).add(new THREE.Vector3(0, 0.05, 0)).add(kickDir).add(spread)
            group.current.add(mesh)
            particles.current.push({
                mesh, life: 1.0,
                velocity: kickDir.add(new THREE.Vector3(0, Math.random() * 1.5, 0)),
                rotSpeed: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10)
            })
        }
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 3.0
            p.velocity.y -= delta * 3
            p.mesh.position.addScaledVector(p.velocity, delta)
            p.mesh.rotation.x += p.rotSpeed.x * delta
            p.mesh.rotation.y += p.rotSpeed.y * delta
            p.mesh.scale.setScalar(p.life)
            // @ts-ignore
            p.mesh.material.opacity = p.life
            if (p.life <= 0) {
                group.current.remove(p.mesh)
                particles.current.splice(i, 1)
            }
        }
    })
    return <group ref={group} />
}

// MECH-012: Command Queue Types
type Command =
    | { type: 'MOVE', target: THREE.Vector3 }
    | { type: 'INTERACT', label: string }
    | { type: 'CALLBACK', fn: () => void }

export interface PlayerHandle {
    triggerInteraction: (label: string) => void
    moveTo: (target: THREE.Vector3, onComplete?: () => void) => void
    enqueueCommand: (cmd: Command) => void
    clearQueue: () => void
}

interface PlayerProps {
    onPositionChange?: (pos: THREE.Vector3) => void
    onRotationChange?: (rot: THREE.Euler) => void // MECH-015
    initialPosition?: [number, number, number]
    bounds?: { width: number, depth: number }
}

const Player = React.forwardRef<PlayerHandle, PlayerProps>(({ onPositionChange, onRotationChange, initialPosition = [0, 0, 0], bounds }, ref) => {
    const group = useRef<THREE.Group>(null)
    const visualGroup = useRef<THREE.Group>(null)
    const rotateGroup = useRef<THREE.Group>(null)

    // Rapier API
    const rigidBodyRef = useRef<RigidBodyApi>(null)
    // We need to track velocity manually for game feel logic, though Rapier handles physics
    const currentVelocity = useRef(new THREE.Vector3())
    const currentPosition = useRef(new THREE.Vector3(...initialPosition))
    const isGrounded = useRef(false)
    const wasGrounded = useRef(false) // MECH-023

    // Game Feel State
    const coyoteTimer = useRef(0)
    const jumpBufferTimer = useRef(0)
    const jumpHeld = useRef(false)
    const interactBufferTimer = useRef(0)
    const { addTrauma } = useCameraStore()

    // Procedural Animation State
    const squashSpring = useRef(new Spring(150, 15))
    const tilt = useRef(0)
    const bank = useRef(0)
    const currentRotation = useRef(0)

    // React State
    const [interactionLabel, setInteractionLabel] = useState<string | null>(null)
    const [interactionTimer, setInteractionTimer] = useState(0)
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const [sparkleTrigger, setSparkleTrigger] = useState(false)
    const [isMovingVisual, setIsMovingVisual] = useState(false)

    // Pathfinding & Controls
    const path = useRef<THREE.Vector3[]>([])
    const currentPathIndex = useRef(0)
    const commandQueue = useRef<Command[]>([]) // MECH-012
    const currentCommand = useRef<Command | null>(null)

    const { joystick, isActionPressed, setActionPressed } = useControlsStore()
    const prevAction = useRef(false)
    const keys = useRef<{ [key: string]: boolean }>({})

    const { playSound } = useAudioStore()

    // Raycast for ground check
    const { rapier, world } = useRapier()

    // --- API ---
    useImperativeHandle(ref, () => ({
        triggerInteraction: (label: string) => {
            setInteractionLabel(label)
            setInteractionTimer(1.5)
            // Stop movement immediately on interaction
            if (rigidBodyRef.current) rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
            setSparkleTrigger(true)
            path.current = []
            commandQueue.current = []
            currentCommand.current = null
        },
        enqueueCommand: (cmd: Command) => {
            commandQueue.current.push(cmd)
        },
        clearQueue: () => {
            commandQueue.current = []
            currentCommand.current = null
            path.current = []
            currentPathIndex.current = 0
        },
        moveTo: (target: THREE.Vector3, onComplete?: () => void) => {
            // MECH-FIX: Robust state reset for Click-To-Move
            commandQueue.current = []
            currentCommand.current = null
            path.current = []
            currentPathIndex.current = 0

            // Validate
            if (!target) return;

            commandQueue.current.push({ type: 'MOVE', target: target.clone() })
            if (onComplete) {
                commandQueue.current.push({ type: 'CALLBACK', fn: onComplete })
            }
        }
    }))

    // --- INPUT HANDLING ---
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key] = true
            if (e.code === 'Space') {
                jumpBufferTimer.current = JUMP_BUFFER
                jumpHeld.current = true
            }
            if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
                interactBufferTimer.current = 0.15
            }
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                // User input cancels automated movement
                path.current = []
                commandQueue.current = []
                currentCommand.current = null
                currentPathIndex.current = 0
            }
        }
        const onKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key] = false
            if (e.code === 'Space') jumpHeld.current = false
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    useEffect(() => {
        if (Math.abs(joystick.x) > 0.1 || Math.abs(joystick.y) > 0.1) {
            path.current = []
            commandQueue.current = []
            currentCommand.current = null
            currentPathIndex.current = 0
        }
    }, [joystick])

    // --- MAIN LOOP ---
    useFrame((state, delta) => {
        // Cap Delta to avoid explosions on lag spikes
        const dt = Math.min(delta, 0.1)

        gameSystemInstance.update(state.clock.elapsedTime, dt)

        if (!rigidBodyRef.current || !group.current || !visualGroup.current || !rotateGroup.current) return

        // Sync position
        const pos = rigidBodyRef.current.translation()
        const vel = rigidBodyRef.current.linvel()
        currentPosition.current.set(pos.x, pos.y, pos.z)
        currentVelocity.current.set(vel.x, vel.y, vel.z)

        // Ground Check
        const rayOrigin = { x: pos.x, y: pos.y + 0.1, z: pos.z } // Offset slightly up
        let groundNormal = new THREE.Vector3(0, 1, 0)
        let hit = null
        if (world) {
            // Cast down
            hit = world.castRay(new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 }), 1.5, true)
        }
        let onGround = false
        if (hit) {
            // Distance of Ray - Offset
            const dist = hit.toi - 0.1
            // Allow slightly higher tolerance for slopes
            if (dist < 0.25 && vel.y < 0.5) {
                onGround = true
                if (hit.normal) groundNormal.set(hit.normal.x, hit.normal.y, hit.normal.z)
            }
        }
        isGrounded.current = onGround

        // MECH-023: Landing Trauma
        if (onGround && !wasGrounded.current) {
            // Landed
            if (vel.y < -8) { // Hard landing check
                addTrauma(0.4)
                squashSpring.current.impulse(-4.0)
            } else if (vel.y < -2) {
                addTrauma(0.15)
                squashSpring.current.impulse(-2.0)
            }
        }
        wasGrounded.current = onGround

        // 1. Interaction Freeze
        if (interactionTimer > 0) {
            setInteractionTimer(t => t - dt)
            if (interactionTimer < 0) setInteractionLabel(null)
            visualGroup.current.rotation.y += 10 * dt
            return
        }

        // 2. Command Queue Processing
        if (!currentCommand.current && commandQueue.current.length > 0) {
            currentCommand.current = commandQueue.current.shift()!

            // Initialize Command
            if (currentCommand.current.type === 'MOVE') {
                const target = currentCommand.current.target
                // Ensure target is valid
                if (target) {
                    const calculatedPath = findPath(currentPosition.current, target)
                    if (calculatedPath.length > 0) {
                        path.current = calculatedPath
                        currentPathIndex.current = 0
                    } else {
                        console.warn("Pathfinding failed or target invalid", target)
                        currentCommand.current = null
                    }
                } else {
                    currentCommand.current = null
                }
            } else if (currentCommand.current.type === 'CALLBACK') {
                try {
                    currentCommand.current.fn()
                } catch (e) {
                    console.error("Command Callback Error", e)
                }
                currentCommand.current = null
            } else if (currentCommand.current.type === 'INTERACT') {
                currentCommand.current = null
            }
        }

        // 3. Input Calculation
        const input = new THREE.Vector3(0, 0, 0)

        // Keyboard
        if (keys.current['w'] || keys.current['ArrowUp']) input.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) input.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) input.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) input.x += 1

        // Joystick
        if (Math.abs(joystick.x) > 0.1) input.x += joystick.x
        if (Math.abs(joystick.y) > 0.1) input.z += joystick.y

        // Normalize Input (Fix Diagonal Speed)
        if (input.lengthSq() > 1) input.normalize()

        // Pathfinding Input Override
        if (input.lengthSq() < 0.01 && path.current.length > 0) {
            // We have a path and no user input
            if (currentPathIndex.current < path.current.length) {
                const target = path.current[currentPathIndex.current]
                const dir = target.clone().sub(currentPosition.current)
                dir.y = 0

                // Distance Check
                const dist = dir.length()
                if (dist < 0.4) {
                    // Reached waypoint
                    currentPathIndex.current++
                    // If finished
                    if (currentPathIndex.current >= path.current.length) {
                        path.current = []
                        if (currentCommand.current?.type === 'MOVE') {
                            currentCommand.current = null
                        }
                    }
                } else {
                    input.copy(dir.normalize())
                }
            } else {
                // Safety cleanup
                path.current = []
            }
        }

        // 4. Physics Movement Calculation (Kinematic-Style)
        const isMoving = input.lengthSq() > 0.01

        let targetVelocity = new THREE.Vector3()

        if (isMoving) {
            // Slope Projection (MECH-FIX)
            if (isGrounded.current) {
                // Calculate "slope forward" direction based on input
                // Cross product approach to align with surface
                // Right vector relative to input and Up
                const right = new THREE.Vector3(input.z, 0, -input.x).normalize()
                // Actual forward aligned to slope
                const slopeForward = new THREE.Vector3().crossVectors(right, groundNormal).normalize()

                // Verify direction
                if (slopeForward.dot(input) < 0) slopeForward.negate()

                // Steep Slope Check (> 45 degrees)
                const slopeAngle = groundNormal.angleTo(new THREE.Vector3(0, 1, 0))
                if (slopeAngle > Math.PI / 3) { // 60 deg max?
                    // Too steep, slide down? Or just block?
                    // Reducing speed significantly on steep slopes
                    targetVelocity.copy(slopeForward).multiplyScalar(MOVE_SPEED * 0.1)
                } else {
                    targetVelocity.copy(slopeForward).multiplyScalar(MOVE_SPEED)
                }
            } else {
                // Air Movement
                targetVelocity.set(input.x * MOVE_SPEED, 0, input.z * MOVE_SPEED)
            }
        }

        const accel = isGrounded.current ? ACCELERATION_GROUND : ACCELERATION_AIR
        const friction = isGrounded.current ? FRICTION_GROUND : FRICTION_AIR

        // Explicit Integration: v = v + a * dt
        const currentH = new THREE.Vector3(vel.x, 0, vel.z)
        let newH = currentH.clone()

        if (isMoving) {
            // Accelerate towards target
            const diff = targetVelocity.clone().sub(newH)
            const maxChange = accel * dt

            if (diff.length() <= maxChange) {
                newH.copy(targetVelocity)
            } else {
                newH.add(diff.normalize().multiplyScalar(maxChange))
            }
        } else {
            // Friction / Deceleration
            const speed = newH.length()
            if (speed > 0) {
                const drop = friction * dt
                const newSpeed = Math.max(0, speed - drop)
                newH.multiplyScalar(newSpeed / speed)
            }
        }

        let newVelY = vel.y

        // 5. Rotation (Smoothed)
        if (isMoving) {
            const targetRot = Math.atan2(input.x, input.z)

            // Shortest angle
            let angleDiff = targetRot - currentRotation.current
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

            // Frame-independent smoothing
            const t = 1.0 - Math.pow(0.01, dt * 2) // Tuned Damping
            currentRotation.current += angleDiff * Math.min(1, ROTATION_SPEED * dt)

            // Banking
            const turnRate = angleDiff * 5.0 // Estimation
            const targetBank = -Math.max(-1, Math.min(1, turnRate)) * BANK_AMOUNT * (newH.length() / MOVE_SPEED)
            bank.current = THREE.MathUtils.lerp(bank.current, targetBank, 10 * dt)
        } else {
            bank.current = THREE.MathUtils.lerp(bank.current, 0, 5 * dt)
        }

        const speedRatio = newH.length() / MOVE_SPEED
        const tiltTarget = speedRatio * TILT_AMOUNT
        tilt.current = THREE.MathUtils.lerp(tilt.current, tiltTarget, 5 * dt)

        rotateGroup.current.rotation.y = currentRotation.current
        rotateGroup.current.rotation.z = bank.current
        rotateGroup.current.rotation.x = tilt.current

        // 6. Jump Physics
        if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= dt
        if (interactBufferTimer.current > 0) interactBufferTimer.current -= dt

        if (!isGrounded.current) coyoteTimer.current += dt
        else coyoteTimer.current = 0

        if (isActionPressed && !prevAction.current) {
            jumpBufferTimer.current = JUMP_BUFFER
            jumpHeld.current = true
        }
        if (!isActionPressed && prevAction.current) {
            jumpHeld.current = false
        }
        prevAction.current = isActionPressed

        if (jumpBufferTimer.current > 0 && (isGrounded.current || coyoteTimer.current < COYOTE_TIME)) {
            newVelY = JUMP_FORCE
            coyoteTimer.current = 100 // invalidate coyote
            jumpBufferTimer.current = 0
            squashSpring.current.impulse(3.0) // Stretch
            playSound('jump')
            addTrauma(0.2) // Increased trauma on jump
        }

        // Variable Jump Height
        if (!jumpHeld.current && newVelY > 0) {
            newVelY *= Math.pow(1.0 - 15.0 * dt, 2) // Smooth cut-off vs linear set
            // or just simple default:
            if (newVelY > 0) newVelY *= JUMP_CUT_HEIGHT // fallback if logic complex
        }

        // Apply
        rigidBodyRef.current.setLinvel(new THREE.Vector3(newH.x, newVelY, newH.z), true)

        // Events
        if (onPositionChange) onPositionChange(currentPosition.current)
        if (onRotationChange) onRotationChange(rotateGroup.current.rotation)

        // Visuals
        squashSpring.current.update(dt)
        const scaleY = squashSpring.current.val
        const scaleXZ = 1 / Math.sqrt(Math.max(0.1, scaleY))
        visualGroup.current.scale.set(scaleXZ, scaleY, scaleXZ)

        if (isMoving !== isMovingVisual) setIsMovingVisual(isMoving)
    })

    const shadowScale = useRef(1)
    useFrame(() => {
        const height = Math.max(0, currentPosition.current.y)
        shadowScale.current = THREE.MathUtils.lerp(shadowScale.current, Math.max(0, 1 - height * 0.5), 0.1)
    })

    return (
        <>
            <CameraShake
                maxPitch={0.05} maxRoll={0.05} maxYaw={0.05}
                intensity={shakeIntensity}
                decay decayRate={0.65}
            />
            <TeleportSparkle
                position={currentPosition.current}
                trigger={sparkleTrigger}
                onComplete={() => setSparkleTrigger(false)}
            />
            {interactionLabel && (
                <Html position={[currentPosition.current.x, currentPosition.current.y + 2, currentPosition.current.z]} center>
                    <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: '800',
                        color: 'white',
                        textShadow: '0px 2px 0px rgba(0,0,0,0.2)',
                        background: '#222',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '2px solid white',
                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        E - {interactionLabel}
                    </div>
                </Html>
            )}

            <RigidBody
                ref={rigidBodyRef}
                position={new THREE.Vector3(...initialPosition)}
                enabledRotations={[false, false, false]}
                colliders={false} // Custom collider
                friction={0} // We handle friction manually
                restitution={0}
                linearDamping={0} // We handle damping manually
                name="player"
            >
                {/* MECH-FIX: Adjusted collider to be slightly thinner to avoid wall clipping */}
                <CapsuleCollider args={[0.25, 0.25]} position={[0, 0.6, 0]} />

                <group ref={group}>
                    <group ref={rotateGroup}>
                        <group ref={visualGroup}>
                            {/* MECH-FIX: Pass actual speed for animation sync */}
                            <RobloxCharacter
                                isMoving={isMovingVisual && isGrounded.current}
                                speed={new THREE.Vector3(currentVelocity.current.x, 0, currentVelocity.current.z).length()}
                            />
                        </group>
                    </group>
                </group>
            </RigidBody>

            <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} follow target={currentPosition.current} />

            <VoxelDust
                position={currentPosition.current}
                velocity={currentVelocity.current}
                isGrounded={isGrounded.current}
            />
        </>
    )
})

export default Player
