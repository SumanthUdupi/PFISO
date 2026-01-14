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
import { useInputBuffer } from '../../hooks/useInputBuffer' // MECH-005
import gameSystemInstance from '../../systems/GameSystem'
import globalEvents from '../../systems/EventManager'
import inputs from '../../systems/InputManager'
import GameEntity from './ECS/GameEntity'
import { entityManager } from '../../systems/EntityManager'
import PositionalSound from '../audio/PositionalSound'




// --- TUNING CONSTANTS ---
// --- TUNING CONSTANTS ---
const MOVE_SPEED = 6
const ACCELERATION_GROUND = 60
const ACCELERATION_AIR = 15
const FRICTION_GROUND = 15
const FRICTION_AIR = 2
const JUMP_FORCE = 12
const ROTATION_SPEED = 12
const DASH_FORCE = 18 // MECH-008
const DASH_COOLDOWN = 1.0
const DASH_DURATION = 0.2

// Game Feel
const COYOTE_TIME = 0.15
const JUMP_BUFFER = 0.15
const JUMP_CUT_HEIGHT = 0.5
const TILT_AMOUNT = 0.15
const BANK_AMOUNT = 0.15


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
    const { bufferInput, consumeInput } = useInputBuffer() // MECH-005
    const coyoteTimer = useRef(0)
    const jumpHeld = useRef(false)
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



    // ... existing imports ...

    // ... inside Player component ...
    // Audio Triggers
    const [playJump, setPlayJump] = useState(false)
    const [playLand, setPlayLand] = useState(false)
    const playSound = (type: string) => {
        if (type === 'jump') { setPlayJump(true); setTimeout(() => setPlayJump(false), 100) }
        else if (type === 'land') { setPlayLand(true); setTimeout(() => setPlayLand(false), 100) }
    }


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
                bufferInput('JUMP', JUMP_BUFFER)
                jumpHeld.current = true
            }
            if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
                bufferInput('INTERACT', 0.15)
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
    }, [bufferInput])

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

        // MECH-044: Update Input System
        inputs.update()

        // MECH-044: Feed Buffer
        if (inputs.justPressed('JUMP')) bufferInput('JUMP', JUMP_BUFFER)
        if (inputs.justPressed('DASH')) bufferInput('DASH', 0.2)
        if (inputs.justPressed('INTERACT')) bufferInput('INTERACT', 0.15)

        jumpHeld.current = inputs.isPressed('JUMP')

        // User input cancels automated movement
        if (inputs.getAxis('MOVE_X') !== 0 || inputs.getAxis('MOVE_Y') !== 0) {
            path.current = []
            commandQueue.current = []
            currentCommand.current = null
        }

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

        if (onGround) {
            canAirDash.current = true // MECH-008: Reset air dash landing
        }

        // MECH-023: Landing Trauma
        if (onGround && !wasGrounded.current) {
            // Landed
            if (Math.abs(currentVelocity.current.y) < -5) { // Hard landing check
                addTrauma(0.4)
                playSound('land')
            } else if (Math.abs(currentVelocity.current.y) < -2) {
                addTrauma(0.15)
                playSound('land')
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
                // MECH-043: Global Event Trigger
                globalEvents.emit('INTERACT_TRIGGER', {
                    label: currentCommand.current.label,
                    initiator: 'player'
                })

                setInteractionLabel(currentCommand.current.label)
                setInteractionTimer(1.5)
                if (rigidBodyRef.current) rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
                setSparkleTrigger(true)
                currentCommand.current = null
            }
        }

        // 3. Input Calculation
        const input = new THREE.Vector3(0, 0, 0)
        input.x = inputs.getAxis('MOVE_X')
        input.z = inputs.getAxis('MOVE_Y')

        // Pathfinding override (Processing MOVE command)
        if (input.lengthSq() === 0 && path.current.length > 0) { // MECH-FIX: ensure we check lengthSq()
            const target = path.current[currentPathIndex.current]
            const dir = target.clone().sub(currentPosition.current)
            dir.y = 0
            if (dir.length() < 0.2) {
                currentPathIndex.current++
                if (currentPathIndex.current >= path.current.length) {
                    path.current = []
                    // Move Complete
                    if (currentCommand.current?.type === 'MOVE') {
                        currentCommand.current = null
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

        // MECH-004: Stair / Step Handling
        // We cast two rays forward: one at "foot" height, one at "knee" height
        // If foot hits but knee doesn't, it's a step
        if (moving && isGrounded.current && world) {
            const stepHeight = 0.4
            const lookDir = input.clone().normalize()
            const kneePos = currentPosition.current.clone().add(new THREE.Vector3(0, stepHeight, 0))
            const footPos = currentPosition.current.clone().add(new THREE.Vector3(0, 0.05, 0))

            // Ray length slightly longer than capsule radius to detect steps ahead
            const rayLen = 0.4

            const kneeHit = world.castRay(new rapier.Ray(kneePos, lookDir), rayLen, true)
            const footHit = world.castRay(new rapier.Ray(footPos, lookDir), rayLen, true)

            // Debug drawing or logic could go here
            if (footHit && footHit.toi < rayLen && (!kneeHit || kneeHit.toi > rayLen)) {
                // We have a low obstacle. 
                // Apply a small vertical smoothing impulse to nudge the player up.
                // We don't want to use velocity directly as it might catapult.
                // Positioning smoothing is safer for "stepping" feel in Rapier.

                // For now, let's try a small velocity boost upwards (hop)
                // In a robust system, we would raise the kinematic target or collider offset
                const currentV = rigidBodyRef.current.linvel()
                if (currentV.y < 2.0) { // Limit step climb speed
                    rigidBodyRef.current.setLinvel({ x: currentV.x, y: 5.0, z: currentV.z }, true)
                }
            }
        }

        // 4. Movement Physics Application (MECH-009: Momentum Conservation)
        let newVel = currentVelocity.current.clone()
        // We only modify horizontal velocity for movement, preserving Y (gravity) unless on slope
        // But for calculation simplicity, let's work on horizontal plane first then re-project or add Y?
        // Actually, working with 3D vector provided by moveDir (slope adjusted) is best.

        // Friction (Ground Only)
        if (isGrounded.current) {
            const speed = newVel.length()
            if (speed > 0.1) {
                const drop = speed * FRICTION_GROUND * delta
                const newSpeed = Math.max(speed - drop, 0)
                newVel.multiplyScalar(newSpeed / speed)
            } else {
                newVel.set(0, 0, 0)
            }
        }

        // Acceleration
        const wishDir = moveDir
        const wishSpeed = moving ? MOVE_SPEED : 0

        // Project current velocity onto wish direction
        const currentSpeedInWishDir = newVel.dot(wishDir)

        // How much speed can we add?
        // If we are already going faster than max speed in this direction (e.g. dash), addSpeed will be negative
        // and we won't add any more speed, but we won't slow down either (unlike lerp).
        const addSpeed = wishSpeed - currentSpeedInWishDir

        if (addSpeed > 0) {
            const accel = isGrounded.current ? ACCELERATION_GROUND : ACCELERATION_AIR
            const accelSpeed = accel * delta

            // Clamp acceleration so we don't overshoot wishSpeed
            const actualAccel = Math.min(accelSpeed, addSpeed)

            newVel.add(wishDir.multiplyScalar(actualAccel))
        }

        // Restore Gravity / Vertical Velocity from Physics Engine (unless we are climbing slope explicitly)
        // If we are on ground and slope is active, newVel.y is set by wishDir.y (slope projection).
        // If we are in air, wishDir.y is 0 usually.
        // However, we must preserve valid falling speed.
        if (!isGrounded.current) {
            newVel.y = vel.y // Keep gravity influence
        } else {
            // On ground, our slope logic in moveDir handles Y. 
            // But if we are "Stopped" (friction), newVel is 0.
            // We should probably ensure we stick to ground? 
            // Rapier handles penetration but we are setting velocity.
            if (newVel.lengthSq() < 0.001) {
                newVel.y = vel.y // Just fall if stopped?
            }
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
        if (!isGrounded.current) coyoteTimer.current += delta
        else coyoteTimer.current = 0

        // Handle Jump Input via Buffer
        if (isActionPressed && !prevAction.current) {
            bufferInput('JUMP', JUMP_BUFFER)
            jumpHeld.current = true
        }
        if (!isActionPressed && prevAction.current) {
            jumpHeld.current = false
            // MECH-006: Variable Jump Height - Cut velocity ONCE on release
            if (currentVelocity.current.y > 0) {
                newVel.y = currentVelocity.current.y * JUMP_CUT_HEIGHT
            }
        }
        prevAction.current = isActionPressed

        // Consume 'JUMP' if conditions met
        if (consumeInput('JUMP') && (isGrounded.current || coyoteTimer.current < COYOTE_TIME)) {
            newVel.y = JUMP_FORCE
            coyoteTimer.current = 100 // invalidate coyote
            squashSpring.current.impulse(3.0)
            playSound('jump')
            // MECH-023: Jump Trauma
            addTrauma(0.1)
        }

        // Removed continuous dampening for MECH-006 in favor of on-release cut above
        /* 
        if (!jumpHeld.current && newVel.y > 0) { 
            newVel.y *= JUMP_CUT_HEIGHT
        }
        */

        if (consumeInput('INTERACT')) {
            // Buffer already consumed, logic handled via command queue or direct trigger if we wanted immediate
        }

        rigidBodyRef.current.setLinvel(newVel, true)

        if (onPositionChange) onPositionChange(currentPosition.current)
        if (onRotationChange) onRotationChange(rotateGroup.current.rotation) // MECH-015

        squashSpring.current.update(delta)
        const scaleY = squashSpring.current.val
        const scaleXZ = 1 / Math.sqrt(scaleY)
        visualGroup.current.scale.set(scaleXZ, scaleY, scaleXZ)

        if (moving !== isMovingVisual) setIsMovingVisual(moving)

        // MECH-042: Sync Position to ECS
        if (currentPosition.current) {
            entityManager.updatePosition('player', currentPosition.current)
        }
    })

    const shadowScale = useRef(1)
    useFrame(() => {
        const height = Math.max(0, currentPosition.current.y)
        shadowScale.current = THREE.MathUtils.lerp(shadowScale.current, Math.max(0, 1 - height * 0.5), 0.1)
    })

    return (
        <GameEntity id="player" tags={['player', 'friendly']} components={{ health: 100, maxHealth: 100 }}>
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

                {/* MECH-045: Spatial Audio */}
                <PositionalSound type="jump" trigger={playJump} volumeMultiplier={0.5} />
                <PositionalSound type="land" trigger={playLand} volumeMultiplier={0.3} />
                <PositionalSound type="step" trigger={isMovingVisual && isGrounded.current} loop volumeMultiplier={0.2} distance={5} />
            </>
        </GameEntity >
    )
})

export default Player
