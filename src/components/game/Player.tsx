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
const MOVE_SPEED = 6
const ACCELERATION_GROUND = 60
const ACCELERATION_AIR = 15
const FRICTION_GROUND = 15
const FRICTION_AIR = 2
const JUMP_FORCE = 12
const ROTATION_SPEED = 12

// Game Feel
const COYOTE_TIME = 0.15
const JUMP_BUFFER = 0.15
const JUMP_CUT_HEIGHT = 0.5
const TILT_AMOUNT = 0.15
const BANK_AMOUNT = 0.15

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
        if (isGrounded && speed > 2 && Math.random() < 0.4) {
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
        },
        moveTo: (target: THREE.Vector3, onComplete?: () => void) => {
            // Legacy support mapping to Queue
            commandQueue.current = []
            currentCommand.current = null
            commandQueue.current.push({ type: 'MOVE', target })
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
        }
    }, [joystick])

    // --- MAIN LOOP ---
    useFrame((state, delta) => {
        gameSystemInstance.update(state.clock.elapsedTime, delta)

        if (!rigidBodyRef.current || !group.current || !visualGroup.current || !rotateGroup.current) return

        // Sync position
        const pos = rigidBodyRef.current.translation()
        const vel = rigidBodyRef.current.linvel()
        currentPosition.current.set(pos.x, pos.y, pos.z)
        currentVelocity.current.set(vel.x, vel.y, vel.z)

        // Ground Check
        const rayOrigin = { x: pos.x, y: pos.y, z: pos.z }
        let groundNormal = new THREE.Vector3(0, 1, 0)
        let hit = null
        if (world) {
            hit = world.castRay(new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 }), 2.0, true)
        }
        let onGround = false
        if (hit) {
            if (hit.toi < 0.2 && Math.abs(vel.y) < 0.5) {
                onGround = true
                if (hit.normal) groundNormal.set(hit.normal.x, hit.normal.y, hit.normal.z)
            }
        }
        isGrounded.current = onGround

        // MECH-023: Landing Trauma
        if (onGround && !wasGrounded.current) {
            // Landed
            if (Math.abs(currentVelocity.current.y) < -5) { // Hard landing check
                addTrauma(0.4)
            } else if (Math.abs(currentVelocity.current.y) < -2) {
                addTrauma(0.15)
            }
        }
        wasGrounded.current = onGround

        // 1. Interaction Freeze
        if (interactionTimer > 0) {
            setInteractionTimer(t => t - delta)
            if (interactionTimer < 0) setInteractionLabel(null)
            visualGroup.current.rotation.y += 10 * delta
            return
        }

        // 2. Command Queue Processing (MECH-012)
        if (!currentCommand.current && commandQueue.current.length > 0) {
            currentCommand.current = commandQueue.current.shift()!

            // Initialize Command
            if (currentCommand.current.type === 'MOVE') {
                const target = currentCommand.current.target
                const calculatedPath = findPath(currentPosition.current, target)
                if (calculatedPath.length > 0) {
                    path.current = calculatedPath
                    currentPathIndex.current = 0
                } else {
                    // Failed to find path, abort
                    currentCommand.current = null
                }
            } else if (currentCommand.current.type === 'CALLBACK') {
                currentCommand.current.fn()
                currentCommand.current = null
            } else if (currentCommand.current.type === 'INTERACT') {
                // Just trigger visual for now, actual logic usually handled by callback or event
                // setInteractionLabel(currentCommand.current.label!)
                // setInteractionTimer(1.5)
                // setSparkleTrigger(true)
                // But wait, the requirement says "Click to move then interact".
                // Usually the interaction happens via callback or event.
                // We'll treat this command as instantaneous
                currentCommand.current = null
            }
        }

        // 3. Input Calculation
        const input = new THREE.Vector3(0, 0, 0)
        if (keys.current['w'] || keys.current['ArrowUp']) input.z -= 1
        if (keys.current['s'] || keys.current['ArrowDown']) input.z += 1
        if (keys.current['a'] || keys.current['ArrowLeft']) input.x -= 1
        if (keys.current['d'] || keys.current['ArrowRight']) input.x += 1

        if (Math.abs(joystick.x) > 0.1) input.x += joystick.x
        if (Math.abs(joystick.y) > 0.1) input.z += joystick.y

        // Pathfinding override (Processing MOVE command)
        if (input.lengthSq() === 0 && path.current.length > 0) {
            const target = path.current[currentPathIndex.current]
            const dir = target.clone().sub(currentPosition.current)
            dir.y = 0
            if (dir.length() < 0.2) {
                currentPathIndex.current++
                if (currentPathIndex.current >= path.current.length) {
                    path.current = []
                    // Move Complete
                    if (currentCommand.current?.type === 'MOVE') {
                        currentCommand.current = null // Command finished
                    }
                }
            } else {
                input.copy(dir.normalize())
            }
        }

        if (input.length() > 1) input.normalize()

        // 4. Movement Physics Application
        const moving = input.lengthSq() > 0.01

        // Slope Logic
        let moveDir = input.clone()
        if (isGrounded.current && moving) {
            moveDir = input.clone().projectOnPlane(groundNormal).normalize()
            const slopeAngle = groundNormal.angleTo(new THREE.Vector3(0, 1, 0))
            if (slopeAngle > Math.PI / 4) {
                moveDir = input.clone()
            }
        }

        const desiredVelocity = moveDir.multiplyScalar(MOVE_SPEED)
        const accel = isGrounded.current ? ACCELERATION_GROUND : ACCELERATION_AIR

        let newVel = new THREE.Vector3()
        if (isGrounded.current) {
            newVel.copy(currentVelocity.current).lerp(desiredVelocity, accel * delta * 0.1)
        } else {
            const currentH = new THREE.Vector3(vel.x, 0, vel.z)
            const desiredH = new THREE.Vector3(desiredVelocity.x, 0, desiredVelocity.z)
            const newH = currentH.lerp(desiredH, accel * delta * 0.1)
            newVel.set(newH.x, vel.y, newH.z)
        }

        // 5. Rotation
        // 5. Rotation - MECH-FIX: Smooth Damping
        if (moving) {
            const targetRot = Math.atan2(input.x, input.z)
            // Shortest angle interpolation
            let angleDiff = targetRot - currentRotation.current
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

            // Use exponential smoothing instead of linear for better feel
            const smoothFactor = 1.0 - Math.exp(-ROTATION_SPEED * delta)
            currentRotation.current += angleDiff * smoothFactor

            const turnRate = angleDiff * smoothFactor / delta
            const targetBank = -turnRate * 0.05 * (newVel.length() / MOVE_SPEED)
            bank.current = THREE.MathUtils.lerp(bank.current, THREE.MathUtils.clamp(targetBank, -BANK_AMOUNT, BANK_AMOUNT), 10 * delta)
        } else {
            bank.current = THREE.MathUtils.lerp(bank.current, 0, 5 * delta)
        }

        const dotProd = input.dot(new THREE.Vector3(newVel.x, 0, newVel.z).normalize())
        const targetTilt = (newVel.length() / MOVE_SPEED) * TILT_AMOUNT * dotProd
        tilt.current = THREE.MathUtils.lerp(tilt.current, targetTilt, 5 * delta)

        rotateGroup.current.rotation.y = currentRotation.current
        rotateGroup.current.rotation.z = bank.current
        rotateGroup.current.rotation.x = tilt.current

        // 6. Jump Physics
        if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= delta
        if (interactBufferTimer.current > 0) interactBufferTimer.current -= delta

        if (!isGrounded.current) coyoteTimer.current += delta
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
            newVel.y = JUMP_FORCE
            coyoteTimer.current = 100
            jumpBufferTimer.current = 0
            squashSpring.current.impulse(3.0)
            playSound('jump')
            // MECH-023: Jump Trauma
            addTrauma(0.1)
        }

        if (!jumpHeld.current && newVel.y > 0) {
            newVel.y *= JUMP_CUT_HEIGHT
        }

        rigidBodyRef.current.setLinvel(newVel, true)

        if (onPositionChange) onPositionChange(currentPosition.current)
        if (onRotationChange) onRotationChange(rotateGroup.current.rotation) // MECH-015

        squashSpring.current.update(delta)
        const scaleY = squashSpring.current.val
        const scaleXZ = 1 / Math.sqrt(scaleY)
        visualGroup.current.scale.set(scaleXZ, scaleY, scaleXZ)

        if (moving !== isMovingVisual) setIsMovingVisual(moving)
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
                friction={0}
                restitution={0}
                linearDamping={0.5}
            >
                {/* MECH-FIX: Adjusted collider to be slightly thinner to avoid wall clipping */}
                <CapsuleCollider args={[0.25, 0.3]} position={[0, 0.6, 0]} />

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
