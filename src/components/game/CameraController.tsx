import React, { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import useCameraStore from '../../stores/cameraStore'
import { useRapier } from '@react-three/rapier'

// MECH-021: Spring Arm
// MECH-022: Look Ahead
// MECH-023: Screen Shake (via store)
// MECH-024: Dynamic FOV

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const X_AXIS = new THREE.Vector3(1, 0, 0)

interface CameraControllerProps {
    targetRef: React.RefObject<THREE.Object3D> // The player object
}

const CameraController: React.FC<CameraControllerProps> = ({ targetRef }) => {
    const { camera } = useThree()
    const { isMobile } = useDeviceDetect()
    const { world, rapier } = useRapier()

    // Config
    const BASE_OFFSET = isMobile ? new THREE.Vector3(0, 15, 15) : new THREE.Vector3(0, 10, 10)
    // CS-012: Reduce Look Ahead
    const LOOK_AHEAD_FACTOR = 0.2
    const SPRINT_FOV_ADD = 5 // Added FOV when sprinting

    // State
    const { decayTrauma, getShake, shoulderSide, resetVersion, lockTarget, fovBase, zoomLevel } = useCameraStore()
    const [gyroEnabled, setGyroEnabled] = useState(false)
    const gyroOffset = useRef({ alpha: 0, beta: 0, gamma: 0 })
    const gyroLook = useRef({ x: 0, y: 0 })

    // Object Pools (Refs) to reduce GC usage
    const lastPos = useRef(new THREE.Vector3())
    const currentVelocity = useRef(new THREE.Vector3())
    const playerPosRef = useRef(new THREE.Vector3())
    const distMovedRef = useRef(new THREE.Vector3())
    const lookAheadOffsetRef = useRef(new THREE.Vector3())
    const focusPointRef = useRef(new THREE.Vector3())

    // CS-009: Smoothed Focus Point
    const smoothedFocusPointRef = useRef(new THREE.Vector3())

    const offsetRef = useRef(new THREE.Vector3())
    const idealPosRef = useRef(new THREE.Vector3())
    const finalPosRef = useRef(new THREE.Vector3())
    const dirRef = useRef(new THREE.Vector3())
    const collisionPointRef = useRef(new THREE.Vector3())
    const shakeOffsetRef = useRef(new THREE.Vector3())
    const smoothedIdealPosRef = useRef(new THREE.Vector3())
    const hasInitialized = useRef(false)

    // CS-008: Reset Camera Logic
    useEffect(() => {
        if (resetVersion > 0) {
            // Reset Gyro
            gyroLook.current = { x: 0, y: 0 }
            gyroOffset.current = { alpha: 0, beta: 0, gamma: 0 }
            // Force re-init smoothing to prevent trails
            hasInitialized.current = false
        }
    }, [resetVersion])

    // On Mount
    useEffect(() => {
        if (isMobile) {
            camera.zoom = 55
            // Request device orientation permission if available
            if ('requestPermission' in DeviceOrientationEvent) {
                (DeviceOrientationEvent as any).requestPermission().then((permission: string) => {
                    if (permission === 'granted') {
                        setGyroEnabled(true);
                    }
                });
            } else {
                setGyroEnabled(true);
            }
        }
        camera.updateProjectionMatrix()
    }, [isMobile, camera])

    // Gyro listener
    useEffect(() => {
        if (!gyroEnabled || !isMobile) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            const alpha = event.alpha || 0;
            const beta = event.beta || 0;
            const gamma = event.gamma || 0;

            if (gyroOffset.current.alpha === 0 && gyroOffset.current.beta === 0 && gyroOffset.current.gamma === 0) {
                gyroOffset.current = { alpha, beta, gamma };
            }

            const relGamma = gamma - gyroOffset.current.gamma;
            const relBeta = beta - gyroOffset.current.beta;

            gyroLook.current.x = Math.max(-1, Math.min(1, relGamma / 45));
            gyroLook.current.y = Math.max(-1, Math.min(1, relBeta / 45));
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [gyroEnabled, isMobile]);

    // CS-024: V-Sync Stutter (LateUpdate) - Priority -1 to run after physics and logic
    useFrame((state, delta) => {
        if (!targetRef.current) return

        const playerPos = playerPosRef.current.copy(targetRef.current.position)

        // Inference of Velocity
        const distMoved = distMovedRef.current.copy(playerPos).sub(lastPos.current)
        const vel = distMoved.divideScalar(Math.max(delta, 0.001))

        currentVelocity.current.lerp(vel, 5 * delta)
        lastPos.current.copy(playerPos)

        const speed = currentVelocity.current.length()

        // 1. Calculate Target Position with Look Ahead
        const lookAheadOffset = lookAheadOffsetRef.current.set(currentVelocity.current.x, 0, currentVelocity.current.z).multiplyScalar(LOOK_AHEAD_FACTOR)
        lookAheadOffset.clampLength(0, 3.0)

        const focusPoint = focusPointRef.current.copy(playerPos).add(lookAheadOffset)

        // Ideal Camera Position
        let offset = offsetRef.current.copy(BASE_OFFSET);

        // CS-003: Shoulder Swap (Offset X)
        const sideOffset = shoulderSide === 'RIGHT' ? 1.5 : -1.5
        offset.x += sideOffset

        if (gyroEnabled && isMobile) {
            const gyroX = gyroLook.current.x * Math.PI / 4;
            const gyroY = gyroLook.current.y * Math.PI / 6;
            offset.applyAxisAngle(Y_AXIS, gyroX);
            offset.applyAxisAngle(X_AXIS, gyroY);
        }
        const idealPos = idealPosRef.current.copy(focusPoint).add(offset)

        // Initialize smoothed pos and focus
        if (!hasInitialized.current) {
            smoothedIdealPosRef.current.copy(idealPos)
            smoothedFocusPointRef.current.copy(focusPoint) // CS-009
            hasInitialized.current = true
        }

        // 2. Smooth the Ideal Position (Damping) (CS-002)
        const damp = 1.0 - Math.exp(-4 * delta)
        smoothedIdealPosRef.current.lerp(idealPos, damp)

        // CS-009: Separate Rotation Damping
        const rotDamp = 1.0 - Math.exp(-8 * delta) // Faster than pos damp
        smoothedFocusPointRef.current.lerp(focusPoint, rotDamp)

        // 3. Collision Resolution (Instant)
        let finalPos = finalPosRef.current.copy(smoothedIdealPosRef.current)

        if (world && rapier) {
            const dir = dirRef.current.copy(smoothedIdealPosRef.current).sub(smoothedFocusPointRef.current)
            const maxDist = dir.length()
            dir.normalize()

            let hit = null
            // CS-010: SphereCast logic
            try {
                // Approximate SphereCast using castShape if available, else Raycast
                // Using a Ball shape of radius 0.2
                // Note: castShape signature varies, assuming (pos, rot, vel, shape, maxToi, ...)
                // Vel is direction * length? No, vel is direction.
                const shape = new rapier.Ball(0.2)
                // castShape(position, rotation, velocity, shape, maxToi, stopAtPenetration)
                hit = world.castShape(
                    smoothedFocusPointRef.current,
                    { w: 1, x: 0, y: 0, z: 0 },
                    dir,
                    shape,
                    maxDist,
                    true
                )
            } catch (e) {
                // Fallback to Raycast
                const ray = new rapier.Ray(smoothedFocusPointRef.current, dir)
                hit = world.castRay(ray, maxDist, true)
            }

            if (hit && hit.toi < maxDist) {
                // Wall detected - Snap instantly to hit point (minus radius/buffer)
                // If SphereCast, toi is distance to shape center.
                // We want camera center to be at hit point.
                // Actually if castShape hits, it means the ball at distance `toi` touches something.
                // So placing camera at `toi` along dir is correct (camera is the ball center).
                const collisionPoint = collisionPointRef.current.copy(smoothedFocusPointRef.current).add(dir.multiplyScalar(hit.toi))
                finalPos.copy(collisionPoint)
            }
        }

        // 4. Screen Shake & Final Application
        decayTrauma(delta)
        const shake = getShake()
        const shakeOffset = shakeOffsetRef.current.set(
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake
        )

        camera.position.copy(finalPos).add(shakeOffset)
        camera.lookAt(smoothedFocusPointRef.current) // CS-009: Look at smoothed target

        // CS-023: Dutch Angle (Tilt on Strafe)
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize()
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize()
        const velHorizontal = new THREE.Vector3(currentVelocity.current.x, 0, currentVelocity.current.z)
        const velMag = velHorizontal.length()

        if (velMag > 0.1) {
            const strafe = velHorizontal.clone().normalize().dot(right)
            // Roll towards the movement direction? Or bank?
            // Usually bank into turn -> move Right -> Roll Left (negative Z)?
            // Or "Dutch Angle" for dynamics -> move Right -> Camera tilts left.
            const targetRoll = -strafe * 0.05 // Max 0.05 radians (~3 degrees)
            // We need to apply this roll. Since we just did lookAt, Z is 0.
            // We can just rotateZ.
            camera.rotateZ(targetRoll * Math.min(velMag / 5, 1)) // Scale by speed
        }

        // 4. Dynamic FOV
        if (camera instanceof THREE.PerspectiveCamera) {
            // Fix: Use fovBase from store and SPRINT_FOV_ADD
            const targetFov = fovBase + (Math.min(speed, 10) / 10) * SPRINT_FOV_ADD
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 2)
            camera.updateProjectionMatrix()
        }
    }, -1)

    return null
}

export default CameraController
