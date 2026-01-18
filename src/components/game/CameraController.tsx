import React, { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import useCameraStore from '../../stores/cameraStore'
import { useRapier } from '@react-three/rapier'
import useControlsStore from '../../stores/controlsStore'

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
    const LOOK_AHEAD_FACTOR = 0.5
    const BASE_FOV = 40
    const SPRINT_FOV = 45

    // State
    const { decayTrauma, getShake } = useCameraStore()
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
    const offsetRef = useRef(new THREE.Vector3())
    const idealPosRef = useRef(new THREE.Vector3())
    const finalPosRef = useRef(new THREE.Vector3())
    const dirRef = useRef(new THREE.Vector3())
    const collisionPointRef = useRef(new THREE.Vector3())
    const shakeOffsetRef = useRef(new THREE.Vector3())

    // On Mount
    useEffect(() => {
        if (isMobile) {
            camera.zoom = 55 // Keep legacy zoom for mobile? Or stick to FOV?
            // Orthographic vs Perspective? Default is Perspective.

            // Request device orientation permission if available
            if ('requestPermission' in DeviceOrientationEvent) {
                (DeviceOrientationEvent as any).requestPermission().then((permission: string) => {
                    if (permission === 'granted') {
                        setGyroEnabled(true);
                    }
                });
            } else {
                setGyroEnabled(true); // Assume granted on older browsers
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

            // Initialize offset on first reading
            if (gyroOffset.current.alpha === 0 && gyroOffset.current.beta === 0 && gyroOffset.current.gamma === 0) {
                gyroOffset.current = { alpha, beta, gamma };
            }

            // Calculate relative angles
            const relGamma = gamma - gyroOffset.current.gamma; // Left/right tilt
            const relBeta = beta - gyroOffset.current.beta; // Front/back tilt

            // Map to look vector (gamma for x, beta for y)
            gyroLook.current.x = Math.max(-1, Math.min(1, relGamma / 45)); // Max 45 degrees
            gyroLook.current.y = Math.max(-1, Math.min(1, relBeta / 45));
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }, [gyroEnabled, isMobile]);

    useFrame((state, delta) => {
        if (!targetRef.current) return

        const playerPos = playerPosRef.current.copy(targetRef.current.position)

        // Inference of Velocity for Look Ahead & FOV
        // Calculate velocity based on position change just for camera smoothing
        const distMoved = distMovedRef.current.copy(playerPos).sub(lastPos.current)
        const vel = distMoved.divideScalar(Math.max(delta, 0.001))

        // Smooth velocity signal
        currentVelocity.current.lerp(vel, 5 * delta)
        lastPos.current.copy(playerPos)

        const speed = currentVelocity.current.length()

        // 1. Calculate Target Position with Look Ahead (MECH-022)
        // Add a portion of velocity to the look target (horizontal only usually)
        const lookAheadOffset = lookAheadOffsetRef.current.set(currentVelocity.current.x, 0, currentVelocity.current.z).multiplyScalar(LOOK_AHEAD_FACTOR)
        // Clamp look ahead to avoid craziness
        lookAheadOffset.clampLength(0, 3.0)

        const focusPoint = focusPointRef.current.copy(playerPos).add(lookAheadOffset)

        // Ideal Camera Position based on Focus Point
        let offset = offsetRef.current.copy(BASE_OFFSET);
        if (gyroEnabled && isMobile) {
            // Apply gyro rotation to offset
            const gyroX = gyroLook.current.x * Math.PI / 4; // Max 45 degrees
            const gyroY = gyroLook.current.y * Math.PI / 6; // Max 30 degrees
            offset.applyAxisAngle(Y_AXIS, gyroX); // Yaw
            offset.applyAxisAngle(X_AXIS, gyroY); // Pitch
        }
        const idealPos = idealPosRef.current.copy(focusPoint).add(offset)

        // 2. Spring Arm / Collision (MECH-021)
        // Raycast from Focus Point to Ideal Camera Position
        let finalPos = finalPosRef.current.copy(idealPos)

        if (world) {
            const dir = dirRef.current.copy(idealPos).sub(focusPoint)
            const maxDist = dir.length()
            dir.normalize()

            // Cast ray
            const ray = new rapier.Ray(focusPoint, dir)
            const hit = world.castRay(ray, maxDist, true)

            if (hit && hit.toi < maxDist) {
                // Wall detected, bring camera in
                const collisionPoint = collisionPointRef.current.copy(focusPoint).add(dir.multiplyScalar(hit.toi - 0.5)) // 0.5 buffer
                // Ensure we don't go INSIDE the player or too close
                if (collisionPoint.distanceTo(focusPoint) > 2.0) {
                    finalPos.copy(collisionPoint)
                }
            }
        }

        // 3. Screen Shake (MECH-023)
        decayTrauma(delta)
        const shake = getShake()
        const shakeOffset = shakeOffsetRef.current.set(
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake,
            (Math.random() - 0.5) * shake
        )

        // Apply Position with Damping
        // Use different damping for position vs collision to avoid clipping latency?
        // Actually simple lerp is fine if update rate matches.
        const damp = 1.0 - Math.exp(-4 * delta)
        camera.position.lerp(finalPos.add(shakeOffset), damp)

        // Look At Focus Point (Smoothly)
        // lookAt every frame at the smoothed Focus Point is good.
        camera.lookAt(focusPoint)

        // 4. Dynamic FOV (MECH-024)
        if (camera instanceof THREE.PerspectiveCamera) {
            const targetFov = BASE_FOV + (Math.min(speed, 10) / 10) * (SPRINT_FOV - BASE_FOV)
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 2)
            camera.updateProjectionMatrix()
        }
    })

    return null
}

export default CameraController
