import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'
import inputs from '../systems/InputManager'
import gameSystemInstance from './GameSystem'
import useCameraStore, { CameraMode } from '../stores/cameraStore'
import useGameStore from '../store'
import { useSettingsStore } from '../stores/settingsStore' // UX-018
import { SpeedLines } from '../components/effects/SpeedLines'

export const CameraSystem = () => {
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

        // UX-018: Scroll Speed
        const handleWheel = (e: WheelEvent) => {
        if (useGameStore.getState().isInventoryOpen || useGameStore.getState().isPaused) return

        const sensitivity = useSettingsStore.getState().scrollSensitivity

        // Adjust zoom
        const currentZoom = useCameraStore.getState().zoomLevel
        const delta = e.deltaY > 0 ? 0.1 : -0.1
        const newZoom = currentZoom + (delta * sensitivity)
        useCameraStore.getState().setZoomLevel(newZoom)
    }
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
        window.removeEventListener('keydown', handleKey)
        window.removeEventListener('wheel', handleWheel)
    }
}, [camera])

// GC Optimization Refs
const _raycaster = useRef(new THREE.Raycaster())
const _pPos = useRef(new THREE.Vector3())
const _frameMove = useRef(new THREE.Vector3())
const _quat = useRef(new THREE.Quaternion())
const _euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
const _baseOffset = useRef(new THREE.Vector3())
const _desiredPos = useRef(new THREE.Vector3())
const _finalPos = useRef(new THREE.Vector3())
const _dir = useRef(new THREE.Vector3())
const _bobVec = useRef(new THREE.Vector3())
const _right = useRef(new THREE.Vector3())
const _flatVel = useRef(new THREE.Vector3())

// Rapier shapes might be persistent, but recreating a small JS wrapper is usually cheap. 
// However, to be safe for GC:
const _ballShape = useRef(new rapier.Ball(0.25))

// CS-024: V-Sync Stutter (LateUpdate) - Priority -1
useFrame((state, delta) => {
    // CS-049: Checking Paused
    if (isPaused) return

    const dt = Math.min(delta, 0.1)

    // --- 1. Input Processing ---
    const rawLookX = inputs.getAxis('LOOK_X')
    const rawLookY = inputs.getAxis('LOOK_Y')

    const avgX = rawLookX
    const avgY = rawLookY

    const applyDeadzone = (val: number, threshold: number) => {
        return Math.abs(val) < threshold ? 0 : val
    }

    let lookX = applyDeadzone(avgX, deadzone)
    // CS-026: Invert Y
    let lookY = applyDeadzone(avgY, deadzone) * (invertY ? -1 : 1)

    // CS-037: Accessibility Assist (Magnetism)
    _raycaster.current.setFromCamera({ x: 0, y: 0 }, camera)

    const cursorType = useGameStore.getState().cursorType
    if (cursorType !== 'DEFAULT') {
        const magnetismFactor = 0.5 // Slow down by 50%
        lookX *= magnetismFactor
        lookY *= magnetismFactor
    }

    // SYS-045: Use GameStore Sensitivity
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
    _pPos.current.set(pPosData.x, pPosData.y, pPosData.z)

    // Calculate Velocity
    _frameMove.current.copy(_pPos.current).sub(lastPlayerPos.current)
    const frameVel = _frameMove.current.divideScalar(Math.max(dt, 0.001)) // Reusing _frameMove as frameVel since frameMove is not used after
    smoothVelocity.current.lerp(frameVel, dt * 5)
    lastPlayerPos.current.copy(_pPos.current)

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
    // Use reuse vector for targetLookAhead
    _dir.current.copy(smoothVelocity.current).setY(0).multiplyScalar(LOOK_AHEAD_FACTOR).clampLength(0, 3.0)
    lookAheadOffset.current.lerp(_dir.current, dt * 2)

    // --- 4. Target Pivot & Offset ---
    // targetPivot reuse _desiredPos (temp) or create new util ref? Let's use _desiredPos temporarily as pivot
    // Actually, let's add _targetPivot ref to be clear
    const targetPivot = _dir.current.copy(_pPos.current).add(pivotOffset).add(lookAheadOffset.current) // reusing _dir as pivot

    // Mode Distance (CS-020) & CS-027 (Zoom Limits)
    let baseDist = 8
    if (mode === CameraMode.FIRST_PERSON) baseDist = 0

    // Apply Zoom Level
    const overrides = useCameraStore.getState().overrides
    if (overrides?.distance !== undefined) baseDist = overrides.distance

    const targetDist = baseDist * zoomLevel

    // CS-034: Collision Recovery Speed
    const distDiff = targetDist - currentDistance.current
    const lerpSpeed = distDiff > 0 ? 10.0 : 5.0

    currentDistance.current = THREE.MathUtils.lerp(currentDistance.current, targetDist, dt * lerpSpeed)

    // Shoulder Offset (CS-003) & CS-045: Third Person Offset (Alignment)
    const sideOffset = shoulderSide === 'RIGHT' ? 0.6 : -0.6
    const actualSideOffset = mode === CameraMode.FIRST_PERSON ? 0 : sideOffset

    // --- 5. Resolve Base Position ---
    _euler.current.set(currentRotation.current.y, effectiveYaw, 0, 'YXZ')
    _quat.current.setFromEuler(_euler.current)

    _baseOffset.current.set(actualSideOffset, 0, currentDistance.current).applyQuaternion(_quat.current)
    _desiredPos.current.copy(targetPivot).add(_baseOffset.current)

    // --- 6. Occlusion / Collision (CS-010) ---
    _finalPos.current.copy(_desiredPos.current)

    if (mode !== CameraMode.FIRST_PERSON && world && rapier && currentDistance.current > 1.0) {
        // Reusing _frameMove as 'dir' for casting
        const dirVec = _frameMove.current.copy(_desiredPos.current).sub(targetPivot)
        const maxDist = dirVec.length()
        dirVec.normalize()

        try {
            // SphereCast
            const hit = world.castShape(
                targetPivot,
                { w: 1, x: 0, y: 0, z: 0 },
                dirVec,
                _ballShape.current,
                maxDist,
                true,
                undefined, // groups
                undefined, // mask
                undefined  // other
            )
            if (hit && hit.toi < maxDist) {
                const safeDist = Math.max(0, hit.toi - 0.2)
                _finalPos.current.copy(targetPivot).add(dirVec.multiplyScalar(safeDist))
            }
        } catch (e) {
            // Fallback
        }
    }

    // --- 7. Screen Shake (CS-014) ---
    decayTrauma(dt)
    const shakeVal = getShake()
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
    _bobVec.current.set(bobX, bobY, 0).applyQuaternion(_quat.current)

    // --- 9. Final Application ---
    camera.position.lerp(_finalPos.current.add(shakeOffset.current).add(_bobVec.current), dt * 20)
    camera.lookAt(targetPivot)

    // --- 10. CS-023 Dutch Angle ---
    if (speed > 0.5) {
        _right.current.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize()
        _flatVel.current.copy(smoothVelocity.current).setY(0).normalize()
        const strafe = _flatVel.current.dot(_right.current)
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
