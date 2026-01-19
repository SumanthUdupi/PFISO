import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'
import inputs from '../systems/InputManager'
import gameSystemInstance from './GameSystem'
import useCameraStore, { CameraMode } from '../stores/cameraStore'
import useGameStore from '../stores/gameStore'
import { SpeedLines } from '../components/effects/SpeedLines'

const CameraSystem = () => {
    const { camera } = useThree()
    const { world, rapier } = useRapier()

    // CS-049: Pause Freeze
    const isPaused = useGameStore(state => state.isPaused)

    // Store State
    const {
        sensitivityX, sensitivityY, deadzone, mode,
        stabilizeRoll, fovBase,
        shoulderSide, decayTrauma, getShake,
        invertY, zoomLevel // CS-026, CS-027
    } = useCameraStore()

    // Internal State
    const currentRotation = useRef({ x: 0, y: 0 })
    const currentDistance = useRef(8)
    const pivotOffset = new THREE.Vector3(0, 1.5, 0)
    const idleTimer = useRef(0)

    // CS-050: Mouse Velocity Smoothing
    const mouseBuffer = useRef<{ x: number, y: number }[]>([])

    // CS-041: Rear View
    const isLookingBehind = useRef(false)

    // Feature Refs
    const bobTime = useRef(0) // CS-025
    const shakeOffset = useRef(new THREE.Vector3()) // CS-014

    // CS-012: Look Ahead Refs
    const lastPlayerPos = useRef(new THREE.Vector3())
    const smoothVelocity = useRef(new THREE.Vector3())
    const lookAheadOffset = useRef(new THREE.Vector3())

    // Constants
    const LOOK_AHEAD_FACTOR = 0.2
    const IDLE_THRESHOLD = 5.0

    useEffect(() => {
        // Init rotation
        const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        currentRotation.current.x = e.y
        currentRotation.current.y = e.x

        // CS-021: Near Plane Clipping
        if (camera instanceof THREE.PerspectiveCamera) {
            camera.near = 0.05
            camera.updateProjectionMatrix()
        }

        // CS-033: Screenshot (Super Resolution)
        const handleKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'p') {
                // R3F way: useThree access
                // Just use window open or download
                const canvas = document.querySelector('canvas')
                if (canvas) {
                    // Simple capture for now, super-res requires separate render pass which is complex here
                    const link = document.createElement('a')
                    link.setAttribute('download', 'screenshot.png')
                    link.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
                    link.click()
                }
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [camera])

    // CS-024: V-Sync Stutter (LateUpdate) - Priority -1
    useFrame((_state, delta) => {
        // CS-049: Checking Paused
        if (isPaused) return

        const dt = Math.min(delta, 0.1)

        // --- 1. Input Processing ---
        const rawLookX = inputs.getAxis('LOOK_X')
        const rawLookY = inputs.getAxis('LOOK_Y')

        // CS-050: Mouse Smoothing - REMOVED for SYS-018 (Raw Input)
        // mouseBuffer.current.push({ x: rawLookX, y: rawLookY })
        // if (mouseBuffer.current.length > 2) mouseBuffer.current.shift()

        // Calculate average
        // let avgX = 0, avgY = 0
        // mouseBuffer.current.forEach(v => { avgX += v.x; avgY += v.y })
        // avgX /= mouseBuffer.current.length || 1
        // avgY /= mouseBuffer.current.length || 1

        const avgX = rawLookX
        const avgY = rawLookY

        const applyDeadzone = (val: number, threshold: number) => {
            return Math.abs(val) < threshold ? 0 : val
        }

        let lookX = applyDeadzone(avgX, deadzone)
        // CS-026: Invert Y
        let lookY = applyDeadzone(avgY, deadzone) * (invertY ? -1 : 1)

        // CS-037: Accessibility Assist (Magnetism)
        // Check if aiming at interactive object
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera({ x: 0, y: 0 }, camera)
        // Assuming we are using a layer or tag system.
        // For now, simpler Magnetism: Slow down if crosshair is over specific types.
        // We'll simulate 'magnetism' by checking gameStore.hoveredObject (if exists)
        // or a simple global state. 
        // Note: gameStore.cursorType === 'TALK' | 'GRAB' implies we are aiming at something.
        const cursorType = useGameStore.getState().cursorType
        if (cursorType !== 'DEFAULT') {
            const magnetismFactor = 0.5 // Slow down by 50%
            lookX *= magnetismFactor
            lookY *= magnetismFactor
        }

        // SYS-045: Use GameStore Sensitivity
        // const { sensitivityX, sensitivityY } = useCameraStore() // OLD
        const sensitivityX = useGameStore.getState().sensitivityX || 1.0
        const sensitivityY = useGameStore.getState().sensitivityY || 1.0

        // --- 2. Update Rotation ---
        currentRotation.current.x -= lookX * 2.0 * sensitivityX * dt
        currentRotation.current.y -= lookY * 2.0 * sensitivityY * dt

        // Clamp Pitch (CS-006)
        const maxPitch = 80 * (Math.PI / 180)
        const minPitch = -80 * (Math.PI / 180)
        currentRotation.current.y = Math.max(minPitch, Math.min(maxPitch, currentRotation.current.y))

        // CS-041: Rear View
        // If pressing LOOK_BEHIND, add 180 to yaw temporarily
        if (inputs.isPressed('LOOK_BEHIND')) {
            isLookingBehind.current = true
        } else {
            isLookingBehind.current = false
        }

        // Apply temporary yaw modification
        let effectiveYaw = currentRotation.current.x
        if (isLookingBehind.current) {
            effectiveYaw += Math.PI
        }

        // Idle Logic (CS-007)
        if (Math.abs(lookX) < 0.001 && Math.abs(lookY) < 0.001) {
            idleTimer.current += dt
            if (idleTimer.current > IDLE_THRESHOLD) {
                // CS-042: Idle Drift (Simple sinusoidal/noise)
                currentRotation.current.x += Math.sin(Date.now() * 0.0005) * 0.0002 // Subtle drift
                currentRotation.current.y += Math.cos(Date.now() * 0.0004) * 0.0001
            }
        } else {
            idleTimer.current = 0
        }

        // --- 3. Player Velocity & Look Ahead ---
        const pPosData = gameSystemInstance.playerPosition
        const pPos = new THREE.Vector3(pPosData.x, pPosData.y, pPosData.z)

        // Calculate Velocity
        const frameMove = pPos.clone().sub(lastPlayerPos.current)
        const frameVel = frameMove.divideScalar(Math.max(dt, 0.001))
        smoothVelocity.current.lerp(frameVel, dt * 5)
        lastPlayerPos.current.copy(pPos)

        const speed = smoothVelocity.current.length()

        // CS-028: Auto-Center on Move
        if (speed > 2.0 && Math.abs(lookX) < 0.01 && Math.abs(lookY) < 0.01 && mode === CameraMode.FOLLOW && !isLookingBehind.current) {
            const targetYaw = Math.atan2(smoothVelocity.current.x, smoothVelocity.current.z) + Math.PI // Behind
            const currentYaw = currentRotation.current.x
            let diff = targetYaw - currentYaw
            while (diff > Math.PI) diff -= Math.PI * 2
            while (diff < -Math.PI) diff += Math.PI * 2
            if (Math.abs(diff) < 1.0) {
                currentRotation.current.x += diff * dt * 0.5
            }
        }

        // Look Ahead Calculation
        const targetLookAhead = smoothVelocity.current.clone()
            .setY(0).multiplyScalar(LOOK_AHEAD_FACTOR).clampLength(0, 3.0)
        lookAheadOffset.current.lerp(targetLookAhead, dt * 2)

        // --- 4. Target Pivot & Offset ---
        const targetPivot = pPos.clone().add(pivotOffset).add(lookAheadOffset.current)

        // Mode Distance (CS-020) & CS-027 (Zoom Limits)
        let baseDist = 8
        if (mode === CameraMode.FIRST_PERSON) baseDist = 0

        // Apply Zoom Level
        // CS-044: Camera Zones (Overrides)
        // If override exists, use it.
        const overrides = useCameraStore.getState().overrides
        if (overrides?.distance !== undefined) baseDist = overrides.distance

        const targetDist = baseDist * zoomLevel

        // CS-034: Collision Recovery Speed
        // If we are recovering (moving out), move faster.
        const distDiff = targetDist - currentDistance.current
        const lerpSpeed = distDiff > 0 ? 10.0 : 5.0 // Faster recovery (10) than zoom in (5)

        currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, targetDist, dt * lerpSpeed)

        // Shoulder Offset (CS-003) & CS-045: Third Person Offset (Alignment)
        // Requirement says "x: 0.5". Adjusted from 1.5 to 0.6 to be closer to player.
        const sideOffset = shoulderSide === 'RIGHT' ? 0.6 : -0.6
        const actualSideOffset = mode === CameraMode.FIRST_PERSON ? 0 : sideOffset

        // --- 5. Resolve Base Position ---
        const quat = new THREE.Quaternion().setFromEuler(
            // Use effectiveYaw which includes potential Rear View
            new THREE.Euler(currentRotation.current.y, effectiveYaw, 0, 'YXZ')
        )
        const baseOffset = new THREE.Vector3(actualSideOffset, 0, currentDistance.current).applyQuaternion(quat)
        const desiredPos = targetPivot.clone().add(baseOffset)

        // --- 6. Occlusion / Collision (CS-010) ---
        let finalPos = desiredPos.clone()

        if (mode !== CameraMode.FIRST_PERSON && world && rapier && currentDistance.current > 1.0) {
            const dir = desiredPos.clone().sub(targetPivot)
            const maxDist = dir.length()
            dir.normalize()

            try {
                // SphereCast (CS-029: Collision Thickness)
                // CS-043: Ceiling Camera - If we hit ceiling, logic handles it naturally via collision, 
                // but we might want up-cast check if requested. Collision usually suffices for "pushing down".
                const shape = new rapier.Ball(0.25) // CL-002: Increased Radius (0.2 -> 0.25)
                const hit = world.castShape(
                    targetPivot,
                    { w: 1, x: 0, y: 0, z: 0 },
                    dir,
                    shape,
                    maxDist,
                    true,
                    undefined, // groups
                    undefined, // mask
                    undefined  // other
                )
                if (hit && hit.toi < maxDist) {
                    // CS-043: Ceiling Camera / CL-002: Wall Clip
                    // Pull back slightly more to prevent near-plane clipping
                    // Near plane is 0.05. Safe margin 0.2.
                    const safeDist = Math.max(0, hit.toi - 0.2)
                    finalPos = targetPivot.clone().add(dir.multiplyScalar(safeDist))
                }
            } catch (e) {
                // Fallback
            }
        }

        // --- 7. Screen Shake (CS-014) ---
        decayTrauma(dt)
        const shakeVal = getShake()
        // CS-047: Damage Shake Direction
        const shakeDir = useCameraStore.getState().shakeDirection
        shakeOffset.current.set(
            (Math.random() - 0.5) * shakeVal * shakeDir.x,
            (Math.random() - 0.5) * shakeVal * shakeDir.y,
            (Math.random() - 0.5) * shakeVal * shakeDir.z
        )

        // --- 8. Head Bob / Run Shake (CS-025) ---
        let bobY = 0
        let bobX = 0
        if (speed > 0.5) {
            const freq = speed * 2.5
            bobTime.current += dt * freq
            const amp = Math.min(speed * 0.02, 0.15)
            bobY = Math.sin(bobTime.current * 2) * amp
            bobX = Math.sin(bobTime.current) * amp
        }
        const bobVec = new THREE.Vector3(bobX, bobY, 0).applyQuaternion(quat)

        // --- 9. Final Application ---
        camera.position.lerp(finalPos.add(shakeOffset.current).add(bobVec), dt * 20)
        camera.lookAt(targetPivot)

        // --- 10. CS-023 Dutch Angle ---
        if (speed > 0.5) {
            const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize()
            const flatVel = smoothVelocity.current.clone().setY(0).normalize()
            const strafe = flatVel.dot(right)
            let targetRoll = -strafe * 0.05
            camera.rotateZ(targetRoll)
        }

    }, -1)

    return (
        <>
            <PointerLockHandler />
            <SpeedLines />
        </>
    )
}

const PointerLockHandler = () => {
    const { gl } = useThree()
    useEffect(() => {
        const canvas = gl.domElement
        const handleClick = () => canvas.requestPointerLock()
        canvas.addEventListener('click', handleClick)
        return () => canvas.removeEventListener('click', handleClick)
    }, [gl])
    return null
}

export default CameraSystem
