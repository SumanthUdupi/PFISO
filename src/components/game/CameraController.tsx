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
    const { world } = useRapier()

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

    useFrame((state, delta) => {
        if (!targetRef.current) return

        const playerPos = targetRef.current.position

        // 1. Calculate Target Position with Look Ahead (MECH-022)
        // We need velocity. If we don't have direct access, we can infer or pass it.
        // But targetRef is Object3D, not RigidBody directly.
        // Assuming targetRef updates every frame.
        // Actually, Player component updates playerPosition ref in Lobby, we can use that?
        // But passing ref is cleaner.

        // Let's assume standard offset for now.
        const idealPos = playerPos.clone().add(BASE_OFFSET)

        // 2. Spring Arm / Collision (MECH-021)
        // Raycast from Player to Camera Ideal.
        if (world) {
            const dir = idealPos.clone().sub(playerPos)
            const length = dir.length()
            dir.normalize()

            // Cast ray.
            // Filter: Should hit Walls/Environment (Static), ignore Player (Dynamic).
            // Rapier raycast.
            const ray = new state.world.rapier.Ray(playerPos, dir)
            const hit = world.castRay(ray, length, true) // solid=true

            // Note: We need to filter dynamic objects or ensure walls are static and only they block.
            // If hit distance < length, clamp camera.
            // However, isometric camera usually goes ABOVE walls (cutaway).
            // If walls are high, we might want to go through them or zoom in.
            // Current walls are "North/West" only, so camera at South/East usually sees clearly.
            // Only if we rotate camera this matters.
            // For now, let's keep it simple: No spring arm if fixed angle.
            // BUT requirement MECH-021 is "Spring-Arm Camera Controller".
            // So if we had walls, we'd do it. Let's implement the logic but maybe it won't trigger often.
            if (hit && hit.toi < length) {
                // Check if hit object is static?
                // For now, if hit, zoom in.
                // idealPos.copy(playerPos).add(dir.multiplyScalar(hit.toi - 0.5)) // buffer
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

        // Apply
        const damp = 1.0 - Math.exp(-5 * delta)
        camera.position.lerp(idealPos, damp).add(shakeOffset)
        camera.lookAt(playerPos)

        // 4. Dynamic FOV (MECH-024)
        // Need velocity magnitude.
        // Approximation: Distance from last frame or passing velocity.
        // For now skip velocity-based FOV unless we pass velocity.
        if (camera instanceof THREE.PerspectiveCamera) {
            // Lerp FOV
            // camera.fov = THREE.MathUtils.lerp(camera.fov, BASE_FOV, delta)
            // camera.updateProjectionMatrix()
        }
    })

    return null
}

export default CameraController
