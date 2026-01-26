import React, { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'
import inputs from '../systems/InputManager'
import gameSystemInstance from './GameSystem'

// --- TUNING ---
const CAMERA_DIST = 8.0
const PIVOT_HEIGHT = 1.5
const LOOK_SPEED = 2.0
const SMOOTH_TIME = 0.1 // Damping time

export const CameraSystem = () => {
    const { camera } = useThree()
    const { world, rapier } = useRapier()

    // State
    const currentRotation = useRef(new THREE.Vector2(0, 0)) // X = Yaw, Y = Pitch
    const currentDist = useRef(CAMERA_DIST)
    const currentPos = useRef(new THREE.Vector3())
    const currentLookAt = useRef(new THREE.Vector3())

    // Smoothing Refs
    const velPos = useRef(new THREE.Vector3())
    const velLook = useRef(new THREE.Vector3())

    useEffect(() => {
        // Initialize
        const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        currentRotation.current.set(e.y, e.x)
    }, [])

    useFrame((state, delta) => {
        const dt = Math.min(delta, 0.1)

        // 1. Input
        const lookX = inputs.getAxis('LOOK_X')
        const lookY = inputs.getAxis('LOOK_Y')

        currentRotation.current.x -= lookX * LOOK_SPEED * dt
        currentRotation.current.y -= lookY * LOOK_SPEED * dt

        // Clamp Pitch
        const minPitch = -85 * (Math.PI / 180)
        const maxPitch = 85 * (Math.PI / 180)
        currentRotation.current.y = Math.max(minPitch, Math.min(maxPitch, currentRotation.current.y))

        // 2. Ideal Position Calculation
        const pPos = gameSystemInstance.playerPosition
        const targetPivot = new THREE.Vector3(pPos.x, pPos.y + PIVOT_HEIGHT, pPos.z)

        // Calculate conversion from Euler to Direction
        // Yaw (X) rotates around Y axis. Pitch (Y) rotates around X axis.
        const yaw = currentRotation.current.x
        const pitch = currentRotation.current.y

        // Direction from Pivot to Camera
        const dir = new THREE.Vector3(
            Math.sin(yaw) * Math.cos(pitch),
            Math.sin(pitch),
            Math.cos(yaw) * Math.cos(pitch)
        )

        const desiredPos = targetPivot.clone().add(dir.multiplyScalar(CAMERA_DIST))

        // 3. Collision (Occlusion)
        let finalDist = CAMERA_DIST

        if (world && rapier) {
            // ShapeCast/RayCast from Pivot to Camera to check for walls
            const rayDir = dir.clone().normalize()
            const rayLen = CAMERA_DIST

            // Start slightly away from pivot to avoid hitting player collider
            const rayOrigin = targetPivot.clone()

            // Raycast
            const hit = world.castRay(new rapier.Ray(rayOrigin, rayDir), rayLen, true)

            if (hit && hit.toi < rayLen && hit.toi > 0.5) { // 0.5 min ignore
                finalDist = Math.max(0.5, hit.toi - 0.2) // Buffer
            }
        }

        const finalTargetPos = targetPivot.clone().add(dir.multiplyScalar(finalDist))

        // 4. Smoothing (Damp)
        // Simple Lerp for robust behavior
        currentPos.current.lerp(finalTargetPos, 10 * dt)
        currentLookAt.current.lerp(targetPivot, 20 * dt) // Look at updates faster

        // 5. Apply
        camera.position.copy(currentPos.current)
        camera.lookAt(currentLookAt.current)

    })

    return null
}

export default CameraSystem
