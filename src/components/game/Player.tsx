import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ContactShadows } from '@react-three/drei'
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier'
import RobloxCharacter from './RobloxCharacter'
// import PhotographyMode from './PhotographyMode' // TODO: Implement
// import PhotoGallery from '../ui/PhotoGallery' // TODO: Implement
import useControlsStore from '../../stores/controlsStore'
import gameSystemInstance from '../../systems/GameSystem'
import inputs from '../../systems/InputManager'
import useGameStore from '../../store'
import { useInputBuffer } from '../../hooks/useInputBuffer'
import eventBus from '../../systems/EventBus'
import useAudioStore from '../../audioStore'
import useCameraStore, { CameraMode } from '../../stores/cameraStore'

// --- COZY TUNING ---
const WALK_SPEED = 9.0 // Increased from 6.0
const SPRINT_SPEED = 14.0 // Increased from 10.0
const CROUCH_SPEED = 3.0
const JUMP_FORCE = 12.0
const ACCELERATION = 40.0 // Increased from 20.0
const ROTATION_SPEED = 12.0


export interface PlayerHandle {
    moveTo: (pos: THREE.Vector3) => void
    triggerInteraction: (label: string) => void
    enqueueCommand: (cmd: any) => void
    clearQueue: () => void
    sit: (position: THREE.Vector3, quaternion: THREE.Quaternion) => void
    unsit: () => void
}

interface PlayerProps {
    initialPosition?: [number, number, number]
    onPositionChange?: (pos: THREE.Vector3) => void
    bounds?: { width: number, depth: number }
}

const Player = forwardRef<PlayerHandle, PlayerProps>(({ initialPosition = [0, 0, 0] }, ref) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null)
    const group = useRef<THREE.Group>(null)
    const visualGroup = useRef<THREE.Group>(null)

    // State
    // const [viewMode, setViewMode] = useState<'FIRST' | 'THIRD'>('THIRD') // MOVED TO STORE
    const currentVelocity = useRef(new THREE.Vector3())
    const currentRotation = useRef(0)
    const isGrounded = useRef(false)
    const [isSitting, setIsSitting] = useState(false)
    const sitTarget = useRef<{ pos: THREE.Vector3, rot: THREE.Quaternion } | null>(null)



    // Command Queue & Auto-Move
    const commandQueue = useRef<any[]>([])
    const autoMoveTarget = useRef<THREE.Vector3 | null>(null)
    const onMoveComplete = useRef<(() => void) | null>(null)
    const chargeStartTime = useRef(0)
    const lastGroundedTime = useRef(0)
    const wasGrounded = useRef(false)
    const previousVelocity = useRef(new THREE.Vector3())

    // Restored Hooks
    const { joystick, isJumpPressed, isCrouchPressed } = useControlsStore()
    const { camera } = useThree()
    const { world, rapier } = useRapier()

    // Event Listeners
    const inputBuffer = useInputBuffer()
    // Carried Object State
    const carriedObject = useRef<THREE.Object3D | null>(null)

    // Expose handle
    useImperativeHandle(ref, () => ({
        moveTo: (pos) => {
            commandQueue.current.push({ type: 'MOVE', target: pos })
        },
        triggerInteraction: (label) => { console.log('Player interacting:', label) },
        enqueueCommand: (cmd) => commandQueue.current.push(cmd),
        clearQueue: () => { commandQueue.current = [] },
        sit: (position, quaternion) => {
            setIsSitting(true)
            sitTarget.current = { pos: position, rot: quaternion }
            useCameraStore.getState().setSitTarget(position)
        },
        unsit: () => {
            setIsSitting(false)
            sitTarget.current = null
            useCameraStore.getState().setSitTarget(null)
            if (rigidBodyRef.current) rigidBodyRef.current.applyImpulse({ x: 0, y: 2, z: 0 }, true)
        }
    }))



    const dropObject = () => {
        if (carriedObject.current) {
            eventBus.emit('OBJECT_DROP', {
                id: carriedObject.current.uuid,
                position: camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1)),
                velocity: { x: 0, y: 0, z: 0 }
            })
            carriedObject.current = null
        }
    }

    const throwObject = (force: number = 10) => {
        if (carriedObject.current) {
            const throwDir = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(force)
            eventBus.emit('OBJECT_DROP', {
                id: carriedObject.current.uuid,
                position: camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1)),
                velocity: throwDir
            })
            // Shake intensity based on force (0.2 to 0.5)
            const shake = 0.2 + ((force - 10) / 20) * 0.3
            eventBus.emit('SCREEN_SHAKE', { intensity: shake })
            carriedObject.current = null
        }
    }

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // View Mode
            if (e.key.toLowerCase() === 'v') {
                const cur = useCameraStore.getState().mode
                const next = cur === CameraMode.FIRST_PERSON ? CameraMode.FOLLOW : CameraMode.FIRST_PERSON
                useCameraStore.getState().setMode(next)
            }
            // Exit Sit
            if (e.key === 'Escape' || e.key === ' ' || e.key.toLowerCase() === 'c') {
                if (isSitting) {
                    setIsSitting(false)
                    sitTarget.current = null
                    if (rigidBodyRef.current) rigidBodyRef.current.applyImpulse({ x: 0, y: 2, z: 0 }, true)
                }
            }
            // G for Throw/Drop
            if (e.key.toLowerCase() === 'g') {
                if (carriedObject.current) dropObject()
            }
        }

        const onMouseDown = (e: MouseEvent) => {
            if (e.button === 0 && carriedObject.current) {
                chargeStartTime.current = Date.now()
                // Optional: Start charge audio/anim
            }
        }

        const onMouseUp = (e: MouseEvent) => {
            if (e.button === 0 && carriedObject.current && chargeStartTime.current > 0) {
                const duration = (Date.now() - chargeStartTime.current) / 1000
                // Clamp charge: Min 0.2s for min throw, Max 1.5s
                const chargeRatio = Math.min(Math.max(duration, 0.2), 1.5) / 1.5
                // Force range: 10 to 30
                const force = 10 + (chargeRatio * 20)

                throwObject(force)
                chargeStartTime.current = 0
            }
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [isSitting])

    // Command Queue Processing
    const processQueue = () => {
        if (commandQueue.current.length === 0) return

        const activeCmd = commandQueue.current[0]
        if (activeCmd.type === 'MOVE') {
            if (!autoMoveTarget.current) {
                autoMoveTarget.current = activeCmd.target
                onMoveComplete.current = () => {
                    commandQueue.current.shift() // Remove finished command
                    autoMoveTarget.current = null
                }
            }
            // Check distance
            // We need to do this check in the main loop really, or here if we access current pos.
            // Using rigidBodyRef in main loop.
            // Actually, we set autoMoveTarget, but the MOVEMENT logic handles the moving.
            // We need to pass stopDistance to the movement logic or check it here.
        } else if (activeCmd.type === 'CALLBACK') {
            activeCmd.fn()
            commandQueue.current.shift()
        }
    }

    // Input Listeners are now handled by inputs.update() called in useFrame

    useFrame((_state, delta) => {
        if (!rigidBodyRef.current || !group.current) return

        // MECH-026: Apply global time scale
        const dt = Math.min(delta, 0.1) * gameSystemInstance.timeScale

        // INPUTS AND GAME SYSTEM UPDATE REMOVED (Handled in Level_01)

        processQueue() // Process command queue

        // Update buffs
        useGameStore.getState().updateBuffs(Date.now())

        // 1. Physics Sync
        const pos = rigidBodyRef.current.translation()
        const vel = rigidBodyRef.current.linvel()
        currentVelocity.current.set(vel.x, vel.y, vel.z)
        gameSystemInstance.playerPosition = { x: pos.x, y: pos.y, z: pos.z }
        gameSystemInstance.playerVelocity = { x: vel.x, y: vel.y, z: vel.z }

        // SITTING LOGIC
        if (isSitting && sitTarget.current) {
            // REQ-001: Camera logic moved to CameraSystem
            // We just ensure the store is updated.
            // This is technically done in sit/unsit, but for safety:
            // const { setSitTarget } = useCameraStore.getState()
            // setSitTarget(sitTarget.current.pos)
            return
        }

        // 2. Ground Check
        const rayOrigin = { x: pos.x, y: pos.y + 0.1, z: pos.z }
        const { bufferInput, consumeInput } = inputBuffer

        // Raycast for ground
        const hit = world.castRay(new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 }), 1.5, true)
        isGrounded.current = !!(hit && hit.toi < 0.25)

        if (inputs.justPressed('JUMP')) bufferInput('JUMP')

        // 3. Inputs
        const moveX = inputs.getAxis('MOVE_X')
        const moveY = inputs.getAxis('MOVE_Y')
        let input = new THREE.Vector3(moveX, 0, -moveY)

        // Joystick override
        if (Math.abs(joystick.x) > 0.1) input.x += joystick.x
        if (Math.abs(joystick.y) > 0.1) input.z += joystick.y

        // AUTO-MOVE OVERRIDE
        if (autoMoveTarget.current) {
            const target = autoMoveTarget.current
            const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z)
            const dist = new THREE.Vector2(target.x - currentPos.x, target.z - currentPos.z).length()
            const activeCmd = commandQueue.current[0]
            const stopDist = (activeCmd && activeCmd.stopDistance) ? activeCmd.stopDistance : 0.5

            if (dist < stopDist) {
                if (onMoveComplete.current) onMoveComplete.current()
                input.set(0, 0, 0)
            }
        }

        if (input.lengthSq() > 1) input.normalize()

        // 3b. Modifiers
        const isCrouching = inputs.isPressed('CROUCH') || isCrouchPressed
        const isSprinting = inputs.isPressed('DASH')

        const isJump = (consumeInput('JUMP') || isJumpPressed)

        // 4. Movement Logic
        let targetSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED
        if (isCrouching) targetSpeed = CROUCH_SPEED

        // Apply buffs
        const { activeBuffs } = useGameStore.getState()
        let speedMultiplier = 1
        activeBuffs.forEach(buff => {
            if (buff.effects.movementSpeed) speedMultiplier *= buff.effects.movementSpeed
        })
        targetSpeed *= speedMultiplier

        // Camera Relative Movement
        const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
        camForward.y = 0
        camForward.normalize()
        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
        camRight.y = 0
        camRight.normalize()

        const moveDir = new THREE.Vector3()

        if (autoMoveTarget.current) {
            const target = autoMoveTarget.current
            const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z)
            const dist = new THREE.Vector2(target.x - currentPos.x, target.z - currentPos.z).length()
            const activeCmd = commandQueue.current[0]
            const stopDist = (activeCmd && activeCmd.stopDistance) ? activeCmd.stopDistance : 0.5
            if (dist > stopDist) {
                moveDir.set(target.x - currentPos.x, 0, target.z - currentPos.z).normalize()
            }
        } else {
            moveDir.addScaledVector(camRight, input.x)
            moveDir.addScaledVector(camForward, input.z)
        }

        if (moveDir.lengthSq() > 0) moveDir.normalize()

        // SLOPE HANDLING
        if (isGrounded.current) {
            // Optional: Project velocity on slope plane
        }

        // PHYSICS MOVEMENT (Smooth Acceleration & Deceleration)
        const currentH = new THREE.Vector3(vel.x, 0, vel.z)

        if (moveDir.lengthSq() < 0.001) {
            // Stopping - apply smooth exponential deceleration (gliding stop)
            const dampingFactor = 10.0 // Higher = faster stop
            const decel = Math.min(dampingFactor * dt, 1.0)
            currentH.lerp(new THREE.Vector3(0, 0, 0), decel)

            // Snap to zero if very slow to prevent micro-sliding
            if (currentH.lengthSq() < 0.01) {
                currentH.set(0, 0, 0)
            }
        } else {
            // Accelerating
            const targetVel = moveDir.multiplyScalar(targetSpeed)
            // Increased responsiveness on ground, slightly less in air
            const accelRate = isGrounded.current ? ACCELERATION : ACCELERATION * 0.3
            const lerpFactor = Math.min(accelRate * dt / targetSpeed, 1.0)

            // Using lerp for smoother direction changes instead of raw force addition
            currentH.lerp(targetVel, lerpFactor)
        }

        // Remove artificial linear damping
        rigidBodyRef.current.setLinearDamping(0) // Control via friction above

        // 2b. Wall Detection 
        let isWallSliding = false
        const wallNormal = new THREE.Vector3()

        if (!isGrounded.current && moveDir.lengthSq() > 0.1) {
            const rayOrigin = { x: pos.x, y: pos.y + 0.5, z: pos.z }
            const rayDir = { x: moveDir.x, y: 0, z: moveDir.z }
            const wallHit = world.castRay(new rapier.Ray(rayOrigin, rayDir), 0.7, true)
            if (wallHit && wallHit.toi < 0.7) {
                isWallSliding = true
                wallNormal.set(-moveDir.x, 0, -moveDir.z).normalize()
            }
        }

        let newVelY = vel.y
        if (isWallSliding && vel.y < 0) {
            newVelY = Math.max(newVelY, -2) // Wall slide friction
        }

        // Jump & Coyote Time
        const COYOTE_TIME = 150
        if (isGrounded.current) lastGroundedTime.current = Date.now()

        const canJump = (Date.now() - lastGroundedTime.current < COYOTE_TIME) && !isSitting

        if (isJump) {
            if (canJump && vel.y < 2) {
                newVelY = JUMP_FORCE
                consumeInput('JUMP')
                lastGroundedTime.current = 0
            } else if (isWallSliding) {
                newVelY = JUMP_FORCE * 0.9
                currentH.add(wallNormal.clone().multiplyScalar(6))
                consumeInput('JUMP')
                eventBus.emit('SCREEN_SHAKE', { intensity: 0.3 })
            }
        }

        // Variable Jump Height
        if (newVelY > 0 && !inputs.isPressed('JUMP')) {
            newVelY *= 0.6
        }

        rigidBodyRef.current.setLinvel({ x: currentH.x, y: newVelY, z: currentH.z }, true)

        // 6. Visual Rotation
        if (moveDir.lengthSq() > 0.1) {
            const targetRot = Math.atan2(moveDir.x, moveDir.z)
            let angleDiff = targetRot - currentRotation.current
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
            currentRotation.current += angleDiff * Math.min(1, ROTATION_SPEED * dt)
            if (visualGroup.current) {
                visualGroup.current.rotation.y = currentRotation.current
                visualGroup.current.rotation.z = 0
            }
        }

        // REQ-001: Camera Logic Moved to CameraSystem.tsx
        // Player only handles physics and animation state now.

        // DYNAMIC FOV - Logic moved to CameraSystem (eventually), 
        // for now we trust CameraSystem to handle view.

        // Impact Handling
        if (isGrounded.current && !wasGrounded.current) {
            if (previousVelocity.current.y < -5) {
                const intensity = Math.min(Math.abs(previousVelocity.current.y) * 0.05, 0.8)
                eventBus.emit('SCREEN_SHAKE', { intensity })
                if (previousVelocity.current.y < -10) gameSystemInstance.hitStop(100)
            }
        }
        wasGrounded.current = isGrounded.current
        previousVelocity.current.copy(new THREE.Vector3(vel.x, vel.y, vel.z))

    })

    // REQ-001: viewMode is now purely for visual toggling
    const cameraMode = useCameraStore(state => state.mode)
    const isThirdPoint = cameraMode === CameraMode.FOLLOW || cameraMode === CameraMode.AIM || cameraMode === CameraMode.INSPECT


    return (
        <>
            {/* PointerLockControls moved to CameraSystem */}

            <RigidBody
                ref={rigidBodyRef}
                position={initialPosition}
                enabledRotations={[false, false, false]}
                colliders={false}
                friction={0}
                linearDamping={0}
            >
                {/* Adjust collider for crouch */}
                <CapsuleCollider args={[0.25, isSitting ? 0.2 : 0.6]} position={[0, isSitting ? 0.4 : 0.9, 0]} />

                <group ref={group}>
                    <group ref={visualGroup}>
                        <group visible={isThirdPoint}>
                            <RobloxCharacter
                                isMoving={(Math.sqrt(currentVelocity.current.x ** 2 + currentVelocity.current.z ** 2) > 0.5) && isGrounded.current}
                                speed={Math.sqrt(currentVelocity.current.x ** 2 + currentVelocity.current.z ** 2)}
                                onStep={() => useAudioStore.getState().playSound('footstep')}
                                isSitting={isSitting}
                                lookTarget={useGameStore.getState().focusedObject?.position ? new THREE.Vector3().copy(useGameStore.getState().focusedObject!.position) : undefined}
                            />
                        </group>
                    </group>
                </group>
            </RigidBody>
            <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} color="#000000" />
        </>
    )
})

export default Player
