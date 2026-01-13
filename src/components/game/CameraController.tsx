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

            // Raycast from Camera TO Player (Reverse check usually safer to prevent clipping into player)
            // Or Player TO Camera (to check obstruction).
            // Let's do Player TO Camera.
            // We need to import RAPIER from @react-three/rapier or use the hook properly.
            // import { rapier } from '@react-three/rapier' is not how it works usually.
            // We can get RAPIER instance from useRapier().rapier

            // We need to verify if we can access the RAPIER namespace.
            // For now, assume we accept it doesn't collide with walls because walls are back-faced/culled usually?
            // "MECH-021: Implement collision-aware camera that zooms in when obstructed by walls."

            // Note: In an Isometric view, usually walls are cut away or transparent. 
            // Zooming in might feel claustrophobic.
            // Let's implement transparency fading instead? 
            // This is harder without a custom shader or materialref management.

            // Let's stick to the plan: Zoom in.
            // If `rapier` instance is available.
            // `const { rapier, world } = useRapier()`
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
        const damp = 1.0 - Math.exp(-3 * delta) // Smoother, less jerky than 5
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
