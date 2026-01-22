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
import useCozyStore from '../../systems/CozySystem'
import useJournalStore from '../../systems/JournalSystem'
import FootstepSystem from '../audio/FootstepSystem'
import { useSettingsStore } from '../../stores/settingsStore' // UX-050
import { projectilePool } from '../../stores/projectilePool' // PERF-008


// --- COZY TUNING ---
const WALK_SPEED = 9.0 // Increased from 6.0
const SPRINT_SPEED = 14.0 // Increased from 10.0
const CROUCH_SPEED = 3.0
const JUMP_FORCE = 15.0 // PM-006: Snappier jump (Gravity -20)
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
    const stunTimer = useRef(0) // PM-007
    const headBobTimer = useRef(0) // PM-005
    const isClimbing = useRef(false) // PM-013
    const throwCharge = useRef(0) // PM-014
    const isSliding = useRef(false) // PM-017
    const slideTimer = useRef(0)
    const leanAmt = useRef(0) // PM-016
    const landOffset = useRef(0) // PM-018
    const isProne = useRef(false) // PM-020
    const sway = useRef(new THREE.Vector2()) // PM-026
    const isPushing = useRef(false) // PM-027
    const jumpBufferTimer = useRef(0) // PM-028
    const timeSinceDamage = useRef(0) // PM-029

    // PM-032: Flashlight
    const [isFlashlightOn, setIsFlashlightOn] = useState(false)
    // PM-033: Interact Spam
    const lastInteractTime = useRef(0)
    // PM-034: Weight
    const currentLoad = useRef(0)

    // PM-035: Emotes
    const [currentEmote, setCurrentEmote] = useState<string | null>(null)
    // PM-037: Recoil
    const recoilOffset = useRef(new THREE.Vector3())
    // PM-040: Swimming
    const isSwimming = useRef(false)
    // PM-041: Slope Launch
    const timeInAir = useRef(0)

    // Refs
    const colliderRef = useRef<any>(null)
    const opacityRef = useRef(1.0) // CS-016

    // Store Actions
    const setStamina = useGameStore(state => state.setStamina)
    const stamina = useGameStore(state => state.stamina)
    const maxStamina = useGameStore(state => state.maxStamina)

    // Restored Hooks
    const { joystick, isJumpPressed, isCrouchPressed } = useControlsStore()
    const { camera } = useThree()
    const { world, rapier } = useRapier()

    // Event Listeners
    const inputBuffer = useInputBuffer()
    // Carried Object State
    const carriedObject = useRef<THREE.Object3D | null>(null)

    const triggerInteraction = (label: string) => {
        // PM-033: Debounce
        const now = Date.now()
        if (now - lastInteractTime.current < 500) return
        lastInteractTime.current = now

        console.log('Player interacting:', label)

        // AUD-015: Foley (Generic Interaction Click)
        useAudioStore.getState().playSound('click')

        const l = label.toLowerCase()
        if (l.includes('coffee')) useCozyStore.getState().brewCoffee()
        if (l.includes('plant')) useCozyStore.getState().waterPlant()
        if (l.includes('pet')) useCozyStore.getState().feedPet()
        if (l.includes('journal')) useJournalStore.getState().unlockEntry('journal_01', 'Discovery', 'Found a journal.')

        // PM-029: Sit Logic
        if (l.includes('chair') || l.includes('bench') || l.includes('seat') || l.includes('stool')) {
            setIsSitting(true)
            if (rigidBodyRef.current) {
                const t = rigidBodyRef.current.translation()
                // Set target slightly lower/aligned? For now use current pos as anchor
                sitTarget.current = { pos: new THREE.Vector3(t.x, t.y, t.z), rot: new THREE.Quaternion() }
            }
        }
    }

    // Expose handle
    useImperativeHandle(ref, () => ({
        moveTo: (pos) => {
            commandQueue.current.push({ type: 'MOVE', target: pos })
        },
        triggerInteraction: triggerInteraction,
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
            // AUD-015: Foley (Drop)
            useAudioStore.getState().playSound('land')
            carriedObject.current = null
        }
    }

    const throwObject = (force: number = 10) => {
        if (carriedObject.current) {
            // CL-021: Throw Clip - Sphere cast to prevent spawning inside wall
            const origin = camera.position.clone()
            const dir = camera.getWorldDirection(new THREE.Vector3())
            const spawnDist = 1.0

            // Raycast/ShapeCast check (Approximation with Ray for now as ShapeCast requires Rapier interaction here which might be complex to setup inside this function if 'world' isn't readily available via closure scope)
            // Ideally use world.castShape. Assuming 'world' is available from useRapier() at top level (it is).

            // Simple Ray check first
            const ray = new rapier.Ray(origin, dir)
            const hit = world.castRay(ray, spawnDist, true)
            const safeDist = hit ? Math.max(0.1, hit.toi - 0.2) : spawnDist

            const spawnPos = origin.add(dir.multiplyScalar(safeDist))

            const throwDir = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(force)
            eventBus.emit('OBJECT_DROP', {
                id: carriedObject.current.uuid,
                position: spawnPos,
                velocity: throwDir
            })
            // Shake intensity based on force (0.2 to 0.5)
            // Shake intensity based on force (0.2 to 0.5)
            const shake = 0.2 + ((force - 10) / 20) * 0.3
            eventBus.emit('SCREEN_SHAKE', { intensity: shake })

            // PH-045: Recoil Physics - Apply backward impulse
            if (rigidBodyRef.current) {
                const recoilDir = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1)
                const recoilForce = force * 0.5 // Scale recoil relative to throw force
                rigidBodyRef.current.applyImpulse({ x: recoilDir.x * recoilForce, y: 0, z: recoilDir.z * recoilForce }, true)

                // Visual Recoil
                recoilOffset.current.x += (Math.random() - 0.5) * 0.1
                recoilOffset.current.y += 0.05 // Up kick
            }

            carriedObject.current = null
        }
    }

    // PM-019: Near Plane Clipping
    useEffect(() => {
        camera.near = 0.05
        camera.updateProjectionMatrix()
    }, [camera])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'z') {
                isProne.current = !isProne.current // PM-020 Toggle
            }
            // PM-032: Flashlight
            if (e.key.toLowerCase() === 'f') {
                setIsFlashlightOn(prev => !prev)
            }
            // PM-035: Emotes
            if (e.key === '1') setCurrentEmote('WAVE')
            if (e.key === '2') setCurrentEmote('DANCE')
            if (e.key === '2') setCurrentEmote('DANCE')
            if (e.key === '0') setCurrentEmote(null) // Stop
            // CS-003: Shoulder Swap
            if (e.key.toLowerCase() === 'h') {
                useCameraStore.getState().toggleShoulderSide()
            }

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
            if (e.button === 0) {
                if (carriedObject.current) {
                    chargeStartTime.current = Date.now()
                    // Optional: Start charge audio/anim
                } else {
                    // PERF-008: Projectile Pooling - Spawn Bullet
                    const origin = camera.position.clone()
                    const dir = camera.getWorldDirection(new THREE.Vector3())
                    // Spawn slightly in front to avoid self-collision if we had it, but raycast handles it.
                    // Visual offset: right hand side?
                    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
                    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion)
                    const spawnPos = origin.add(dir.multiplyScalar(0.5)).add(right.multiplyScalar(0.2)).add(up.multiplyScalar(-0.1))

                    projectilePool.spawn(spawnPos, dir, 50.0)

                    // Audio
                    useAudioStore.getState().playSound('shoot_pistol') // Assuming sound exists, if not use click or throw.

                    // Recoil
                    recoilOffset.current.x += (Math.random() - 0.0) * 0.05
                    recoilOffset.current.y += 0.02
                    if (rigidBodyRef.current) {
                        const recoilForce = 1.0
                        rigidBodyRef.current.applyImpulse({ x: -dir.x * recoilForce, y: 0, z: -dir.z * recoilForce }, true)
                    }
                }
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

    // Command Listener
    useEffect(() => {
        const onCommand = (cmd: any) => {
            if (cmd.type === 'MOVE_AND_INTERACT') {
                commandQueue.current.push({ type: 'MOVE', target: cmd.target, stopDistance: cmd.stopDistance })
                commandQueue.current.push({ type: 'CALLBACK', fn: () => triggerInteraction(cmd.label) })
            }
        }
        eventBus.on('PLAYER_COMMAND', onCommand)
        return () => eventBus.off('PLAYER_COMMAND', onCommand)
    }, [])

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

    // GC Optimization Refs
    const _vec3 = useRef(new THREE.Vector3())
    const _vec3_2 = useRef(new THREE.Vector3())
    const _vec3_3 = useRef(new THREE.Vector3())
    const _vec2 = useRef(new THREE.Vector2())
    const _ray = useRef(new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }))

    useFrame((state, delta) => {
        if (!rigidBodyRef.current || !group.current) return

        // PM-005: Head Bob
        const camMode = useCameraStore.getState().mode
        const { reducedMotion } = useSettingsStore.getState() // UX-050

        if (camMode === CameraMode.FIRST_PERSON) {
            // PM-049: Dynamic FOV (CS-001: Ease-in/out curve)
            const speed = currentVelocity.current.length()
            const speedRatio = Math.min(speed / SPRINT_SPEED, 1.0)
            const easeInOut = speedRatio < 0.5
                ? 4 * speedRatio * speedRatio * speedRatio
                : 1 - Math.pow(-2 * speedRatio + 2, 3) / 2

            const targetFOV = 75 + (easeInOut * 15) // Max +15 FOV at full sprint
            // UX-050: Reduce FOV changes if reduced motion
            const finalFov = reducedMotion ? 75 : THREE.MathUtils.lerp(state.camera.fov, targetFOV, delta * 4)
            state.camera.fov = finalFov
            state.camera.updateProjectionMatrix()

            if (!reducedMotion && (Math.sqrt(currentVelocity.current.x ** 2 + currentVelocity.current.z ** 2) > 0.1) && isGrounded.current) {
                headBobTimer.current += delta * 14.0
                const bobY = Math.sin(headBobTimer.current) * 0.05
                state.camera.position.y += bobY
            } else {
                headBobTimer.current = 0
            }
        }

        // PM-048: Breath Holding (Aiming?)
        // If holding shift while NOT moving -> Hold Breath (Stabilize sway)
        // Reusing isSprinting input (Shift)
        // PM-048: Breath Holding (Aiming?)
        // If holding shift while NOT moving -> Hold Breath (Stabilize sway)
        // Reusing isSprinting input (Shift)
        // Fix: Use inputs.isPressed('DASH') instead of useControlsStore.isPressed('SPRINT')
        if (inputs.isPressed('DASH') && currentVelocity.current.length() < 0.1 && stamina > 0) {
            // PH-048: Drain stamina faster when holding breath
            setStamina(prev => Math.max(0, prev - 15 * delta))
            sway.current.lerp(_vec2.current.set(0, 0), delta * 10) // Stabilize fast
        }


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

        // SITTING LOGIC (PM-029 Smooth Entry)
        if (isSitting && sitTarget.current) {
            const targetPos = sitTarget.current.pos
            const currentPos = rigidBodyRef.current.translation()

            // Allow small physics steps or force set? Force set for stability in sit.
            // Lerp for smoothness
            const lerpSpeed = 5.0 * dt
            const newX = THREE.MathUtils.lerp(currentPos.x, targetPos.x, lerpSpeed)
            const newZ = THREE.MathUtils.lerp(currentPos.z, targetPos.z, lerpSpeed)

            rigidBodyRef.current.setTranslation({ x: newX, y: targetPos.y, z: newZ }, true)
            rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true) // Kill velocity
            return
        }

        // 2. Ground Check
        // Reuse _vec3 for ray origin
        const rayOrigin = _vec3.current.set(pos.x, pos.y + 0.1, pos.z)
        const { bufferInput, consumeInput } = inputBuffer

        // Raycast for ground
        // Reuse _ray
        _ray.current.origin = rayOrigin
        _ray.current.dir = { x: 0, y: -1, z: 0 }
        const hit = world.castRay(_ray.current, 1.5, true)
        isGrounded.current = !!(hit && hit.toi < 0.25)

        if (inputs.justPressed('JUMP')) bufferInput('JUMP')

        // 3. Inputs
        const moveX = inputs.getAxis('MOVE_X')
        const moveY = inputs.getAxis('MOVE_Y')
        // Reuse _vec3_2 for input
        let input = _vec3_2.current.set(moveX, 0, -moveY)

        // Joystick override
        if (Math.abs(joystick.x) > 0.1) input.x += joystick.x
        if (Math.abs(joystick.y) > 0.1) input.z += joystick.y

        // PM-007: Stun blocks input
        if (stunTimer.current > 0) {
            input.set(0, 0, 0)
        }

        // MECH-048: Cancel auto-move if manual input detected
        if (input.lengthSq() > 0.1 && autoMoveTarget.current) {
            autoMoveTarget.current = null
            commandQueue.current = []
            onMoveComplete.current = null
        }


        // AUTO-MOVE OVERRIDE
        if (autoMoveTarget.current) {
            const target = autoMoveTarget.current
            // Use _vec3_3 for currentPos
            const currentPos = _vec3_3.current.set(pos.x, pos.y, pos.z)
            const dist = _vec2.current.set(target.x - currentPos.x, target.z - currentPos.z).length()
            const activeCmd = commandQueue.current[0]
            const stopDist = (activeCmd && activeCmd.stopDistance) ? activeCmd.stopDistance : 0.5

            if (dist < stopDist) {
                if (onMoveComplete.current) onMoveComplete.current()
                input.set(0, 0, 0)
            }
        }

        if (input.lengthSq() > 1) input.normalize()

        // Calculate Camera Directions & MoveDir (Moved Up)
        // Use _vec3 for camForward (was rayOrigin, safe to reuse now)
        const camForward = _vec3.current.set(0, 0, -1).applyQuaternion(camera.quaternion)
        camForward.y = 0
        camForward.normalize()

        // Use _vec3_3 for camRight (was currentPos, safe)
        const camRight = _vec3_3.current.set(1, 0, 0).applyQuaternion(camera.quaternion)
        camRight.y = 0
        camRight.normalize()

        // moveDir - We need a 4th vector or reuse.
        // input is _vec3_2.
        // We can reuse a new one? No.
        // Let's create one locally for now, 1 alloc is better than 8.
        const moveDir = new THREE.Vector3()

        if (autoMoveTarget.current) {
            const target = autoMoveTarget.current
            const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z)
            // Use 2D distance for movement
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


        // 3b. Modifiers
        const isCrouching = inputs.isPressed('CROUCH') || isCrouchPressed
        const isSprinting = inputs.isPressed('DASH')

        const isJump = (consumeInput('JUMP') || isJumpPressed)

        // 4. Movement Logic
        // Stamina Logic (PM-001)
        const { stamina: currentStaminaState, maxStamina: currentMaxStamina } = useGameStore.getState()
        const isMoving = moveDir.lengthSq() > 0.01 // Check if trying to move
        const STAMINA_DRAIN = 25.0
        const STAMINA_REGEN = 15.0

        let newStamina = currentStaminaState
        const canSprint = currentStaminaState > 0

        // Drain/Regen
        if (isSprinting && isMoving && !isCrouching && canSprint) {
            newStamina -= STAMINA_DRAIN * dt
        } else {
            // Regen if not sprinting or not moving (or crouching)
            // Pause regen slightly after drain? For now instant regen.
            newStamina += STAMINA_REGEN * dt
        }

        // Clamp and Update
        newStamina = Math.min(Math.max(newStamina, 0), currentMaxStamina)
        // Update store if changed significantly to avoid spam, but 60fps UI needs frequent updates.
        // We'll update every frame for smoothness.
        if (newStamina !== currentStaminaState) setStamina(newStamina)

        let targetSpeed = (isSprinting && canSprint) ? SPRINT_SPEED : WALK_SPEED

        if (isCrouching) {
            targetSpeed = CROUCH_SPEED
        } else if (isProne.current) {
            targetSpeed = 2.0 // PM-020
        }

        // PM-034: Weight Modifier (Placeholder logic)
        // If load > 50, slow down.
        if (currentLoad.current > 50) {
            targetSpeed *= 0.7
        }

        // PM-036: Ceiling Bump
        // Raycast Up - Start from top of capsule (approx 1.35m) to avoid self-collision
        const ceilOrigin = { x: pos.x, y: pos.y + 1.35, z: pos.z }
        const ceilHit = world.castRay(new rapier.Ray(ceilOrigin, { x: 0, y: 1, z: 0 }), 0.5, true)
        if (ceilHit && ceilHit.toi < 0.3) {
            targetSpeed *= 0.5
            if (currentVelocity.current.y > 0) {
                rigidBodyRef.current.setLinvel({ x: vel.x, y: 0, z: vel.z }, true)
            }
        }

        // Apply buffs
        const { activeBuffs } = useGameStore.getState()
        let speedMultiplier = 1
        activeBuffs.forEach(buff => {
            if (buff.effects.movementSpeed) speedMultiplier *= buff.effects.movementSpeed
        })
        targetSpeed *= speedMultiplier

        // PM-013: Ladder Logic
        if (isClimbing.current) {
            rigidBodyRef.current.setGravityScale(0)
            const climbSpeed = 5.0
            const climbVel = input.z * climbSpeed
            rigidBodyRef.current.setLinvel({ x: 0, y: climbVel, z: 0 }, true)

            if (isJump) {
                isClimbing.current = false
                rigidBodyRef.current.setGravityScale(1.0)
                rigidBodyRef.current.applyImpulse({ x: 0, y: JUMP_FORCE * 0.5, z: -5 }, true)
                consumeInput('JUMP')
            }
            if (isGrounded.current && climbVel < 0) {
                isClimbing.current = false
                rigidBodyRef.current.setGravityScale(1.0)
            }
        } else {
            rigidBodyRef.current.setGravityScale(1.0)
            // Ladder Detection Placeholder (Raycast)
            // if (isMoving && input.z > 0 && detectLadder()) isClimbing.current = true
        }

        // PM-014: Throw Charge Logic
        // Fix: Use inputs.isPressed('PRIMARY_ACTION') instead of isMouseLeftPressed
        if (inputs.isPressed('PRIMARY_ACTION')) {
            throwCharge.current = Math.min(throwCharge.current + dt * 2.0, 1.0)
        } else {
            if (throwCharge.current > 0) {
                // console.log(`PM-014: Throwing force ${throwCharge.current}`)
                throwCharge.current = 0
            }
        }

        // PM-002: Dynamic Friction for Slope Sliding
        if (colliderRef.current) {
            // ... existing slope logic ...
        }

        // PM-037: Procedural Recoil Decay
        recoilOffset.current.lerp(new THREE.Vector3(0, 0, 0), dt * 10)
        // Apply recoil to camera (simple offset)
        if (camMode === CameraMode.FIRST_PERSON) {
            state.camera.rotation.x += recoilOffset.current.x
            state.camera.rotation.y += recoilOffset.current.y
        }

        // PM-040: Swimming Logic
        // Simple water plane check at y = -1.5
        if (pos.y < -1.5) {
            if (!isSwimming.current) {
                isSwimming.current = true
                rigidBodyRef.current.setGravityScale(0.2) // Buoyancy
                // PM-047: Water Splash
                useAudioStore.getState().playSound('splash_enter')
                eventBus.emit('PARTICLE_SPAWN', { type: 'WATER_SPLASH', position: pos })
            }
            // Swim movement (fly-like)
            // Reduce friction
            rigidBodyRef.current.setLinearDamping(1.0)
        } else {
            if (isSwimming.current) {
                isSwimming.current = false
                rigidBodyRef.current.setGravityScale(1.0)
                rigidBodyRef.current.setLinearDamping(0)
                // PM-047: Water Splash Exit
                useAudioStore.getState().playSound('splash_exit')
            }
        }

        const desiredFriction = (isMoving || !isGrounded.current || isSliding.current) ? 0.0 : 2.0
        colliderRef.current.setFriction(desiredFriction)
        // Removed premature closing brace

        // PM-003: Step Handling
        // Detect low obstacles and boost over them
        if (isMoving && isGrounded.current && !isJump && moveDir.lengthSq() > 0.01) {
            const stepRayOrigin = { x: pos.x, y: pos.y + 0.1, z: pos.z } // Ankle height
            const stepRayDir = { x: moveDir.x, y: 0, z: moveDir.z }
            const stepHit = world.castRay(new rapier.Ray(stepRayOrigin, stepRayDir), 0.3, true)

            if (stepHit && stepHit.toi < 0.3) {
                // We hit something low. Check if it's a step (clear above)
                const highRayOrigin = { x: pos.x, y: pos.y + 0.45, z: pos.z } // Knee/Thigh height (max step)
                const highHit = world.castRay(new rapier.Ray(highRayOrigin, stepRayDir), 0.5, true)

                // If high ray is clear OR hits further away than the low ray
                if (!highHit || highHit.toi > stepHit.toi + 0.1) {
                    // It's a step! Boost.
                    if (vel.y < 0.5) { // Only if not already flying up
                        rigidBodyRef.current.setLinvel({ x: vel.x, y: 3.0, z: vel.z }, true)
                    }
                }
            }
        }
        // MoveDir logic was moved up


        // PM-017: Slide Mechanic
        // Entry
        if (isSprinting && inputs.justPressed('CROUCH') && isMoving && isGrounded.current && !isSliding.current) {
            isSliding.current = true
            slideTimer.current = 0.8 // 0.8s slide
            // Boost velocity in current direction
            const boostDir = moveDir.clone().normalize()
            const slideForce = 12.0
            rigidBodyRef.current.applyImpulse({ x: boostDir.x * slideForce, y: 0, z: boostDir.z * slideForce }, true)

            // Emit sound
            useAudioStore.getState().playSound('slide')
        }

        // Slide Update
        if (isSliding.current) {
            slideTimer.current -= dt
            if (slideTimer.current <= 0 || vel.length() < 1.0) {
                isSliding.current = false
            }
            // Friction is already handled in Dynamic Friction (PM-002) section?
            // We need to ensure PM-002 logic sees 'isSliding' as low friction.
            // Wait, PM-002 logic is at line ~365 below this block.
            // I will modify PM-002 section to check isSliding.
        }

        // PM-016: Leaning + CL-041: Lean Clip Check
        const isLeanLeft = inputs.isPressed('LEAN_LEFT')
        const isLeanRight = inputs.isPressed('LEAN_RIGHT')
        let targetLean = isLeanLeft ? 0.3 : (isLeanRight ? -0.3 : 0)

        // CL-041: Probe Check
        if (targetLean !== 0) {
            const leanDir = new THREE.Vector3(targetLean > 0 ? -1 : 1, 0, 0).applyQuaternion(camera.quaternion)
            const leanRay = new rapier.Ray({ x: pos.x, y: pos.y + 1.6, z: pos.z }, leanDir)
            const hit = world.castRay(leanRay, 0.5, true)
            if (hit && hit.toi < 0.4) {
                targetLean = 0 // Blocked
            }
        }

        leanAmt.current = THREE.MathUtils.lerp(leanAmt.current, targetLean, dt * 5)

        // Apply Lean to Camera (Z rotation + X offset)
        if (Math.abs(leanAmt.current) > 0.01) {
            state.camera.rotation.z += leanAmt.current * 0.5 // Tilt
            state.camera.position.x += leanAmt.current * 1.5 // Offset
        }

        // PM-043: Camera Clipping (SpringArm equivalent)
        // Only for Third Person, or if we had a boom.
        // For First Person, we ensure near plane is small (already done in PM-019).
        // If we were implementing Third Person collision:
        if (camMode !== CameraMode.FIRST_PERSON) {
            const camDir = state.camera.position.clone().sub(pos).normalize()
            const camDist = state.camera.position.distanceTo(pos)

            // CL-011: Camera Near Plane Fade
            // If camera is very close (< 0.5m), fade out character to prevent clipping
            if (camDist < 0.5) {
                opacityRef.current = Math.max(0, (camDist - 0.2) / 0.3) // Fade 0.5 -> 0.2
            } else {
                opacityRef.current = 1.0
            }

            // Simple raycast from head to camera
            const ray = new rapier.Ray({ x: pos.x, y: pos.y + 1.6, z: pos.z }, camDir)
            const hit = world.castRay(ray, camDist, true)
            if (hit && hit.toi < camDist) {
                // Move camera to hit point
                const hitPos = ray.pointAt(hit.toi * 0.9) // Pull back slightly
                state.camera.position.set(hitPos.x, hitPos.y, hitPos.z)
            }
        } else {
            opacityRef.current = 0.0 // Always invisible in FPS
        }

        // PM-029: Health Regen
        timeSinceDamage.current += dt
        if (timeSinceDamage.current > 5.0 && useGameStore.getState().health < useGameStore.getState().maxHealth) {
            useGameStore.getState().heal(10 * dt) // 10 HP/sec
        }

        // PM-026: Weapon Sway (Carried Object)
        if (carriedObject.current) {
            // CL-003: Weapon through Wall - Render On Top
            if (!carriedObject.current.userData.depthFixed) {
                carriedObject.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.renderOrder = 999
                        if (child.material) {
                            child.material.depthTest = false
                            child.material.depthWrite = false
                        }
                    }
                })
                carriedObject.current.userData.depthFixed = true
            }

            const lx = inputs.getAxis('LOOK_X') || 0
            const ly = inputs.getAxis('LOOK_Y') || 0
            sway.current.lerp({ x: lx * 0.1, y: ly * 0.1 }, dt * 5)
            carriedObject.current.position.x += sway.current.x * 0.05
            carriedObject.current.position.y += sway.current.y * 0.05
            // Reset spring
            // CL-013: Adjusted resting position (z: 0.5 -> 0.7) to prevent clipping into body
            // CL-024: Dynamic Side Hold for Large Objects
            let targetX = 0.5
            let targetZ = 0.7
            if (carriedObject.current.geometry) {
                carriedObject.current.geometry.computeBoundingBox()
                const width = carriedObject.current.geometry.boundingBox.max.x - carriedObject.current.geometry.boundingBox.min.x
                if (width > 0.5) targetX = 0.8 // Move further side for large objects
            }

            // CL-044: Phone Hand Clip - Specialized grip for Phone
            if (carriedObject.current.name.toLowerCase().includes('phone')) {
                targetX = 0.3
                targetZ = 0.4
                carriedObject.current.rotation.x = -Math.PI / 4 // Angled up
            }

            carriedObject.current.position.lerp(new THREE.Vector3(targetX, -0.3, targetZ), dt * 2)
        }

        // PM-027: Push Detection
        isPushing.current = false
        if (isMoving && moveDir.lengthSq() > 0.1) {
            // Start ray outside capsule radius (0.25)
            const startOffset = moveDir.clone().multiplyScalar(0.3)
            const pushRay = new rapier.Ray({ x: pos.x + startOffset.x, y: pos.y + 0.5, z: pos.z + startOffset.z }, { x: moveDir.x, y: 0, z: moveDir.z })
            const pushHit = world.castRay(pushRay, 0.2, true) // Check 0.2m further (total 0.5m)
            if (pushHit && pushHit.toi < 0.2) {
                isPushing.current = true
            }
        }

        // PH-016: Character Push Force Limit
        if (isPushing.current) {
            targetSpeed *= 0.1 // Significantly reduce speed when pushing (simulating resistance)
        }

        // PM-015: Inspect Object
        if (camMode === CameraMode.INSPECT && carriedObject.current) {
            // Rotate object based on mouse
            const lookX = inputs.getAxis('LOOK_X') || 0
            const lookY = inputs.getAxis('LOOK_Y') || 0
            carriedObject.current.rotation.y += lookX * 0.01
            carriedObject.current.rotation.x += lookY * 0.01
        }


        // PM-021: Breathing Audio
        if (stamina < 30 && isMoving) {
            // Basic randomized breathing if low stamina
            if (Math.random() < 0.01) useAudioStore.getState().playSound('breath_heavy')
        }

        // PM-023: Mantle/Vault
        // Check for wall at chest height
        if (inputs.justPressed('JUMP')) {
            const vaultOrigin = { x: pos.x, y: pos.y + 1.0, z: pos.z } // Chest height
            const vaultDir = { x: moveDir.x, y: 0, z: moveDir.z }
            // Only vault if moving forward into wall
            if (moveDir.lengthSq() > 0.1) {
                const vaultHit = world.castRay(new rapier.Ray(vaultOrigin, vaultDir), 0.6, true)
                if (vaultHit && vaultHit.toi < 0.6) {
                    // Wall detected. Check clear head space
                    const headOrigin = { x: pos.x, y: pos.y + 1.7, z: pos.z }
                    const headHit = world.castRay(new rapier.Ray(headOrigin, vaultDir), 0.8, true)

                    if (!headHit) {
                        // Head clear -> Vault
                        rigidBodyRef.current.applyImpulse({ x: moveDir.x * 2.5, y: 6.0, z: moveDir.z * 2.5 }, true)
                        useAudioStore.getState().playSound('climb')
                        consumeInput('JUMP')
                    }
                }
            }
        }

        // SLOPE HANDLING
        if (isGrounded.current) {
            // Optional: Project velocity on slope plane
        }

        // PHYSICS MOVEMENT (Smooth Acceleration & Deceleration)
        const currentH = new THREE.Vector3(vel.x, 0, vel.z)

        if (moveDir.lengthSq() < 0.001) {
            // Stopping - apply smooth exponential deceleration (gliding stop)
            const dampingFactor = 10.0 // Higher = faster stop
            // PH-020: Frame Rate Dependency - Use exponential decay
            const decel = 1.0 - Math.exp(-dampingFactor * dt)
            currentH.lerp(new THREE.Vector3(0, 0, 0), decel)

            // Snap to zero if very slow to prevent micro-sliding
            if (currentH.lengthSq() < 0.01) {
                currentH.set(0, 0, 0)
            }
        } else {
            // Accelerating
            const targetVel = moveDir.multiplyScalar(targetSpeed)
            // Increased responsiveness on ground, significantly less in air (PM-004: 0.1)
            const accelRate = isGrounded.current ? ACCELERATION : ACCELERATION * 0.1

            // PH-020: Frame Rate Dependency - Use exponential decay for acceleration
            // k = accelRate / targetSpeed? To approximate reaching targetSpeed.
            // Actually, we want rate of change 'accelRate'.
            // Simple approach: lerpFactor = 1 - exp(-k * dt)
            // If we treat ACCELERATION as the 'stiffness' of the velocity spring.
            const lerpFactor = 1.0 - Math.exp(-accelRate * dt)

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

        // Jump & Coyote Time (PM-028 Buffer)
        const COYOTE_TIME = 150
        if (isGrounded.current) lastGroundedTime.current = Date.now()

        // Update Buffer
        if (inputs.justPressed('JUMP')) jumpBufferTimer.current = 0.2
        if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= dt

        const canJump = (Date.now() - lastGroundedTime.current < COYOTE_TIME) && !isSitting

        // Jump Execution
        if (jumpBufferTimer.current > 0) {
            if (canJump && vel.y < 2) {
                newVelY = JUMP_FORCE
                jumpBufferTimer.current = 0 // Consume buffer
                // consumeInput('JUMP') // No longer needed if we use buffer exclusively? 
                // But we should consume to prevent other systems firing?
                consumeInput('JUMP')
                lastGroundedTime.current = 0
            } else if (isWallSliding) {
                newVelY = JUMP_FORCE * 0.9
                currentH.add(wallNormal.clone().multiplyScalar(6))
                jumpBufferTimer.current = 0
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

        // CS-016: Occlusion Masking Calculation
        const camDist = state.camera.position.distanceTo(new THREE.Vector3(pos.x, pos.y + 1.0, pos.z))
        // Fade out between 1.5m and 0.5m
        opacityRef.current = THREE.MathUtils.clamp((camDist - 0.5) / 1.0, 0.0, 1.0)

        // REQ-001: Camera Logic Moved to CameraSystem.tsx
        // Player only handles physics and animation state now.

        // DYNAMIC FOV - Logic moved to CameraSystem (eventually), 
        // for now we trust CameraSystem to handle view.

        // Impact Handling (PM-007: Fall Damage & Stun)
        if (isGrounded.current && !wasGrounded.current) {
            const impactVel = previousVelocity.current.y

            // PM-018: Landing Animation (Visual Dip)
            if (impactVel < -2) {
                landOffset.current = Math.max(impactVel * 0.05, -0.4) // Cap at -0.4
            }

            if (impactVel < -5) {
                const intensity = Math.min(Math.abs(impactVel) * 0.05, 0.8)
                eventBus.emit('SCREEN_SHAKE', { intensity })

                // Damage Calculation
                if (impactVel < -12) {
                    const damage = Math.floor(Math.abs(impactVel) * 2)
                    useGameStore.getState().takeDamage(damage)
                    console.log(`Fall Damage: ${damage}`)

                    // Stun Logic
                    if (impactVel < -18) {
                        stunTimer.current = 1.0 // 1 second stun
                        gameSystemInstance.hitStop(150)
                    } else if (impactVel < -15) {
                        stunTimer.current = 0.5 // 0.5s stun
                    }
                }
            }
        }
        wasGrounded.current = isGrounded.current
        previousVelocity.current.copy(new THREE.Vector3(vel.x, vel.y, vel.z))

        // Decrement Stun
        if (stunTimer.current > 0) {
            stunTimer.current -= dt
            if (stunTimer.current < 0) stunTimer.current = 0
            // Block Movement if stunned (override input)
            input.set(0, 0, 0)
            // Note: input variable is local above, but we are at end of frame. 
            // Wait, 'input' was used to calculate moveDir earlier.
            // I need to gate 'moveDir' or 'input' earlier in the frame.
            // Re-structuring: I will move this stun decrement to the INPUT section effectively.
            // But since I am editing the END of the file, I can't easily change the top efficiently without large replace.
            // However, I can override 'currentH' (horizontal velocity) here to 0 if stunned.
            if (stunTimer.current > 0) {
                currentH.set(0, 0, 0)
                rigidBodyRef.current.setLinvel({ x: 0, y: vel.y, z: 0 }, true)
            }
        }

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
                ccd={true} // CL-001: Player CCD
            >
                {/* Adjust collider for crouch (PM-008) and prone (PM-020) */}
                {/* CL-005: Head Ceiling Clip - Reduced HalfHeight (0.6 -> 0.4) to match visual ~1.3m */}
                {/* CL-004: Floor Clipping - Adjusted Position (0.9 -> 0.65) to align bottom to 0 */}
                <CapsuleCollider
                    ref={colliderRef}
                    args={[
                        isProne.current ? 0.1 : ((isSitting || isCrouchPressed) ? 0.12 : 0.4), // HalfHeight (Crouch: 0.12 + 0.25 = 0.37 * 2 = 0.74m total. Fits under 0.75m desk?)
                        0.25 // Radius
                    ]}
                    position={[
                        0,
                        isProne.current ? 0.35 : ((isSitting || isCrouchPressed) ? 0.37 : 0.65), // Center Y
                        0
                    ]}
                />

                <group ref={group} position={[0, 0.06, 0]}> {/* CL-004: Visual Offset */}
                    <group ref={visualGroup}>
                        <group visible={isThirdPoint}>
                            <RobloxCharacter
                                opacityRef={opacityRef} // CS-016
                                isMoving={(Math.sqrt(currentVelocity.current.x ** 2 + currentVelocity.current.z ** 2) > 0.5) && isGrounded.current}
                                speed={Math.sqrt(currentVelocity.current.x ** 2 + currentVelocity.current.z ** 2)}
                                onStep={() => {
                                    // Managed by FootstepSystem
                                }}
                                isSitting={isSitting}
                                isPushing={isPushing.current} // PM-027
                                lookTarget={useGameStore.getState().focusedObject?.position ? new THREE.Vector3().copy(useGameStore.getState().focusedObject!.position) : undefined}
                            />
                        </group>
                    </group>

                    {/* PM-032: Flashlight */}
                    {isFlashlightOn && (
                        <group position={[0, 1.5, 0]}>
                            <spotLight
                                position={[0.2, -0.1, 0.2]}
                                target-position={[0, -0.1, 5]}
                                angle={0.5}
                                penumbra={0.2}
                                intensity={2.0}
                                castShadow
                                color="#ffffee"
                            />
                        </group>
                    )}
                </group>
            </RigidBody>
            <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} color="#000000" />
            <FootstepSystem rigidBodyRef={rigidBodyRef} isGrounded={isGrounded} />
        </>
    )
})

export default Player
