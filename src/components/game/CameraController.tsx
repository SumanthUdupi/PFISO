import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import useCameraStore from '../../stores/cameraStore'
import { useRapier } from '@react-three/rapier'

// MECH-021: Spring Arm
// MECH-022: Look Ahead
// MECH-023: Screen Shake (via store)
// MECH-024: Dynamic FOV

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
    const currentLookAhead = useRef(new THREE.Vector3())
    const { decayTrauma, getShake } = useCameraStore()

    // On Mount
    useEffect(() => {
        if (isMobile) {
            camera.zoom = 55 // Keep legacy zoom for mobile? Or stick to FOV?
            // Orthographic vs Perspective? Default is Perspective.
        }
        camera.updateProjectionMatrix()
    }, [isMobile, camera])

    // State for Mechanics
    const lastPos = useRef(new THREE.Vector3())
    const currentVelocity = useRef(new THREE.Vector3())

    useFrame((state, delta) => {
        if (!targetRef.current) return

        const playerPos = targetRef.current.position.clone()

        // Inference of Velocity for Look Ahead & FOV
        // Calculate velocity based on position change just for camera smoothing
        const distMoved = playerPos.clone().sub(lastPos.current)
        const vel = distMoved.divideScalar(Math.max(delta, 0.001))

        // Smooth velocity signal
        currentVelocity.current.lerp(vel, 5 * delta)
        lastPos.current.copy(playerPos)

        const speed = currentVelocity.current.length()

        // 1. Calculate Target Position with Look Ahead (MECH-022)
        // Add a portion of velocity to the look target (horizontal only usually)
        const lookAheadOffset = new THREE.Vector3(currentVelocity.current.x, 0, currentVelocity.current.z).multiplyScalar(LOOK_AHEAD_FACTOR)
        // Clamp look ahead to avoid craziness
        lookAheadOffset.clampLength(0, 3.0)

        const focusPoint = playerPos.clone().add(lookAheadOffset)

        // Ideal Camera Position based on Focus Point
        const idealPos = focusPoint.clone().add(BASE_OFFSET)

        // 2. Spring Arm / Collision (MECH-021)
        // Raycast from Focus Point to Ideal Camera Position
        let finalPos = idealPos.clone()

        if (world) {
            const dir = idealPos.clone().sub(focusPoint)
            const maxDist = dir.length()
            dir.normalize()

            // Cast ray
            const ray = new state.rapier.Ray(focusPoint, dir)
            const hit = world.castRay(ray, maxDist, true)

            if (hit && hit.toi < maxDist) {
                // Wall detected, bring camera in
                const collisionPoint = focusPoint.clone().add(dir.multiplyScalar(hit.toi - 0.5)) // 0.5 buffer
                // Ensure we don't go INSIDE the player or too close
                if (collisionPoint.distanceTo(focusPoint) > 2.0) {
                    finalPos.copy(collisionPoint)
                }
            }
        }

        // 3. Screen Shake (MECH-023)
        decayTrauma(delta)
        const shake = getShake()
        const shakeOffset = new THREE.Vector3(
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
        // We can't lerp lookAt directly easily, usually we lerp the quaternion or just lookAt every frame.
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
