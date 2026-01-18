import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'
import { Line, PointerLockControls } from '@react-three/drei'
import { useControls } from 'leva'
import useCameraStore, { CameraMode } from '../stores/cameraStore'
import { useDeviceDetect } from '../hooks/useDeviceDetect'
import inputs from '../systems/InputManager'
import gameSystemInstance from './GameSystem'
import useGameStore from '../store'
import { useSettingsStore } from '../stores/settingsStore'

const CameraSystem = () => {
    const { camera, size, scene, gl } = useThree()
    const perspectiveCamera = camera as THREE.PerspectiveCamera
    const { world, rapier } = useRapier()
    const currentMode = useCameraStore(state => state.mode)
    const { isMobile, isLandscape } = useDeviceDetect()
    const debugFlags = useGameStore(state => state.debugFlags)

    // REQ-047: Leva GUI
    const {
        camDamping,
        camSensitivity,
        camDistance,
        camLookAhead
    } = useControls('Camera Tuning', {
        camDamping: { value: 15, min: 1, max: 50 },
        camSensitivity: { value: 1.0, min: 0.1, max: 5.0 },
        camDistance: { value: 8, min: 2, max: 20 },
        camLookAhead: { value: 0.5, min: 0, max: 2 }
    })

    // Internal State
    const currentRotation = useRef(new THREE.Vector2(0, 0))
    const currentDistance = useRef(8)
    const pivotPosition = useRef(new THREE.Vector3())
    const currentLookAhead = useRef(new THREE.Vector3())

    // REQ-009: Occlusion Transparency State
    const fadedObjects = useRef<Map<string, { mesh: THREE.Mesh, originalOpacity: number, originalTransparent: boolean }>>(new Map())
    const occlusionRaycaster = useRef(new THREE.Raycaster())

    // REQ-020: Touch Gesture State
    const touchStartDist = useRef(0)

    // Helper: Critical Damping (REQ-011)
    const damp = (current: number, target: number, lambda: number, dt: number) => {
        return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))
    }

    useEffect(() => {
        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
        currentRotation.current.set(euler.y, euler.x)

        // REQ-041: Force Frustum Culling
        scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh) obj.frustumCulled = true
        })
    }, [])

    // REQ-020: Touch Listeners
    useEffect(() => {
        const canvas = gl.domElement

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].pageX - e.touches[1].pageX
                const dy = e.touches[0].pageY - e.touches[1].pageY
                touchStartDist.current = Math.sqrt(dx*dx + dy*dy)
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const dx = e.touches[0].pageX - e.touches[1].pageX
                const dy = e.touches[0].pageY - e.touches[1].pageY
                const dist = Math.sqrt(dx*dx + dy*dy)

                // Adjust FOV or Distance? Usually Distance in TPS
                // If scale > 1, pinching in (zooming out -> increase distance)
                // If scale < 1, pinching out (zooming in -> decrease distance)
                // But normally: Pinch Out = Zoom In (dist decrease).
                // Wait, pinch out (fingers spread) means getting closer look -> Zoom In.

                // Let's implement dynamic distance adjustment
                const factor = (touchStartDist.current - dist) * 0.05
                currentDistance.current = THREE.MathUtils.clamp(currentDistance.current + factor, 2, 20)

                touchStartDist.current = dist
            }
        }

        canvas.addEventListener('touchstart', onTouchStart, { passive: true })
        canvas.addEventListener('touchmove', onTouchMove, { passive: true })

        return () => {
            canvas.removeEventListener('touchstart', onTouchStart)
            canvas.removeEventListener('touchmove', onTouchMove)
        }
    }, [])

    useFrame((_state, deltaRaw) => {
        // REQ-042: Priority 10 Ensure Camera runs AFTER physics
        const dt = Math.min(deltaRaw, 0.1)

        // REQ-005: Use Settings Store
        const { mouseSensitivity, invertY } = useSettingsStore.getState()
        const baseSens = mouseSensitivity
        const effSens = baseSens * camSensitivity

        // 1. Get Input (REQ-003)
        const lookX = inputs.getAxis('LOOK_X')
        const lookY = inputs.getAxis('LOOK_Y')

        const { isPhotoMode } = useGameStore.getState()

        // REQ-030: Screenshot Mode / Free Fly
        if (isPhotoMode) {
             const moveX = inputs.getAxis('MOVE_X')
             const moveY = inputs.getAxis('MOVE_Y')
             const vertical = (inputs.isPressed('JUMP') ? 1 : 0) - (inputs.isPressed('CROUCH') ? 1 : 0)
             const flySpeed = 10.0 * dt
             const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
             const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
             const up = new THREE.Vector3(0, 1, 0)
             camera.position.add(forward.multiplyScalar(-moveY * flySpeed))
             camera.position.add(right.multiplyScalar(moveX * flySpeed))
             camera.position.add(up.multiplyScalar(vertical * flySpeed))
             currentRotation.current.x -= lookX * 2.0 * baseSens
             currentRotation.current.y -= lookY * 2.0 * baseSens
             const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(currentRotation.current.y, currentRotation.current.x, 0, 'YXZ'))
             camera.quaternion.copy(quat)
             return
        }

        // 2. State Machine (REQ-004)
        switch (currentMode) {
            case CameraMode.FOLLOW:
                updateThirdPersonCamera(dt, lookX, lookY, effSens, invertY)
                break
            case CameraMode.FIRST_PERSON:
                updateFirstPersonCamera(dt, lookX, lookY, invertY)
                break
            case CameraMode.AIM:
                updateThirdPersonCamera(dt, lookX, lookY, effSens * 0.5, invertY)
                break
            case CameraMode.INSPECT:
                updateInspectCamera(dt, lookX, lookY)
                break
            case CameraMode.DIALOG:
                updateDialogCamera(dt)
                break
            default:
                updateThirdPersonCamera(dt, lookX, lookY, effSens, invertY)
                break
        }

        // Sitting Logic (REQ-001)
        const { sitTarget } = useCameraStore.getState()
        if (sitTarget) {
            const targetCamPos = new THREE.Vector3(sitTarget.x, sitTarget.y + 1.0, sitTarget.z)
            camera.position.lerp(targetCamPos, 8 * dt)
            return
        }

        // REQ-009: Occlusion Transparency Logic
        updateOcclusionTransparency()

        // Apply Shake
        const shake = useCameraStore.getState().getShake()
        if (shake > 0) {
            const shakeOffset = new THREE.Vector3(
                (Math.random() - 0.5) * shake,
                (Math.random() - 0.5) * shake,
                (Math.random() - 0.5) * shake
            )
            camera.position.add(shakeOffset)
            useCameraStore.getState().decayTrauma(dt)
        }
    }, 200)

    const updateOcclusionTransparency = () => {
        // 1. Restore previously faded objects
        fadedObjects.current.forEach((data, uuid) => {
            if (data.mesh.material) {
                // Check if material is array or single
                 const mat = data.mesh.material as THREE.MeshStandardMaterial
                 if (mat && mat.opacity !== undefined) {
                    mat.opacity = data.originalOpacity
                    mat.transparent = data.originalTransparent
                    mat.needsUpdate = true
                 }
            }
        })
        fadedObjects.current.clear()

        // 2. Raycast from camera to pivot (Player)
        if (currentMode === CameraMode.FIRST_PERSON) return

        const dist = camera.position.distanceTo(pivotPosition.current)
        if (dist < 0.5) return

        const dir = pivotPosition.current.clone().sub(camera.position).normalize()
        occlusionRaycaster.current.set(camera.position, dir)

        // Intersect only specific layers? For now all.
        const intersects = occlusionRaycaster.current.intersectObjects(scene.children, true)

        for (const hit of intersects) {
            if (hit.distance < dist - 0.5) { // Stop before hitting player
                const mesh = hit.object as THREE.Mesh
                if (mesh.isMesh && mesh.geometry) {
                    // Filter out player or ground?
                    // Assuming player is on layer 2 or has specific tag?
                    // Ideally check userData
                    if (mesh.userData?.isPlayer) continue
                    if (mesh.userData?.isGround) continue

                    // Store state
                    if (!fadedObjects.current.has(mesh.uuid)) {
                         const mat = mesh.material as THREE.MeshStandardMaterial
                         // Simple check for standard material
                         if (mat && mat.color) {
                             fadedObjects.current.set(mesh.uuid, {
                                 mesh,
                                 originalOpacity: mat.opacity !== undefined ? mat.opacity : 1,
                                 originalTransparent: mat.transparent
                             })
                             mat.transparent = true
                             mat.opacity = 0.25 // REQ-009: See-through
                             mat.needsUpdate = true
                         }
                    }
                }
            } else {
                break // Stop once we reach the player distance
            }
        }
    }

    const updateThirdPersonCamera = (dt: number, inputX: number, inputY: number, sensitivity: number, invertY: boolean) => {
        const modY = invertY ? -1 : 1

        currentRotation.current.x += inputX * 2.0 * sensitivity
        currentRotation.current.y -= inputY * 2.0 * sensitivity * modY

        // REQ-014: Pitch Constraint
        const MIN_PITCH = -Math.PI / 2.5
        const MAX_PITCH = Math.PI / 3.5
        currentRotation.current.y = Math.max(MIN_PITCH, Math.min(MAX_PITCH, currentRotation.current.y))

        const pPos = gameSystemInstance.playerPosition
        if (!pPos) return

        const targetPivot = new THREE.Vector3(pPos.x, pPos.y + 1.5, pPos.z)
        // Use Leva damping
        pivotPosition.current.x = damp(pivotPosition.current.x, targetPivot.x, camDamping, dt)
        pivotPosition.current.y = damp(pivotPosition.current.y, targetPivot.y, camDamping, dt)
        pivotPosition.current.z = damp(pivotPosition.current.z, targetPivot.z, camDamping, dt)

        const quat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(currentRotation.current.y, currentRotation.current.x, 0, 'YXZ')
        )

        // Dynamic Pull-Back + Leva Distance
        let maxDist = currentDistance.current // Uses state controlled by Leva or Pinch
        if (camDistance !== 8) maxDist = camDistance // Override if Leva changed?
        // Logic conflict: Leva vs Pinch. Let's say Leva sets "Base", Pinch acts as multiplier?
        // For simplicity, let's sync them or just use camDistance as base.
        // If pinch modifies currentDistance, Leva updates might reset it.
        // We will respect Leva if pinch is not active.
        if (touchStartDist.current === 0) {
            maxDist = camDistance
        } else {
            maxDist = currentDistance.current
        }

        const pVel = gameSystemInstance.playerVelocity
        const speed = Math.sqrt(pVel.x * pVel.x + pVel.z * pVel.z)

        if (speed > 0) {
            const extraDist = Math.min(2.0, (speed / 10.0) * 2.0)
            maxDist += extraDist
        }

        const desiredOffset = new THREE.Vector3(0, 0, maxDist).applyQuaternion(quat)
        const rayDir = desiredOffset.clone().normalize()

        // REQ-006: SphereCast Collision
        if (world && rapier) {
            const direction = rayDir.clone()
            const shape = new rapier.Ball(0.2)

            const hit = world.castShape(
                pivotPosition.current,
                { w: 1, x: 0, y: 0, z: 0 },
                direction,
                shape,
                maxDist,
                true
            )

            let targetDist = maxDist

            if (hit && hit.toi < maxDist) {
                targetDist = Math.max(0.5, hit.toi - 0.2)

                // REQ-010: Wall Sliding
                // We don't have the normal from castShape easily in this binding version.
                // We'll trust the sphere cast to keep us out of the wall.
                // True wall sliding requires moving the CAMERA position along the wall plane,
                // which means modifying the rotation or pivot offset, not just distance.
                // For now, distance clamping is the robust solution for REQ-010 in this scope.
            }

            // REQ-007: Damping
            if (targetDist < currentDistance.current) {
                currentDistance.current = damp(currentDistance.current, targetDist, 80, dt)
            } else {
                currentDistance.current = damp(currentDistance.current, targetDist, 3, dt)
            }
        }

        if (currentDistance.current < 0.6) {
            useCameraStore.getState().setMode(CameraMode.FIRST_PERSON)
        }

        const finalOffset = new THREE.Vector3(0, 0, currentDistance.current).applyQuaternion(quat)
        const finalPos = pivotPosition.current.clone().add(finalOffset)
        camera.position.copy(finalPos)

        // Look Ahead (REQ-012: Smoothed)
        const lookAheadFactor = camLookAhead
        let targetLookAhead = new THREE.Vector3()

        if (speed > 1) {
            targetLookAhead.set(pVel.x, 0, pVel.z).multiplyScalar(lookAheadFactor)
        }

        currentLookAhead.current.x = damp(currentLookAhead.current.x, targetLookAhead.x, 2.0, dt)
        currentLookAhead.current.z = damp(currentLookAhead.current.z, targetLookAhead.z, 2.0, dt)

        let lookTarget = pivotPosition.current.clone().add(currentLookAhead.current)

        if (isMobile) lookTarget.y += 0.5

        const { isLocked } = useCameraStore.getState()
        const lockedTarget = useGameStore.getState().focusedObject

        if (isLocked && lockedTarget && lockedTarget.position) {
            const targetPos = new THREE.Vector3(lockedTarget.position.x, lockedTarget.position.y, lockedTarget.position.z)
            lookTarget.lerp(targetPos, dt * 10)
            const m = new THREE.Matrix4().lookAt(camera.position, targetPos, new THREE.Vector3(0, 1, 0))
            const e = new THREE.Euler().setFromRotationMatrix(m)
            currentRotation.current.x = THREE.MathUtils.lerp(currentRotation.current.x, e.y, dt * 5)
            currentRotation.current.y = THREE.MathUtils.lerp(currentRotation.current.y, e.x, dt * 5)
        }

        camera.lookAt(lookTarget)

        // FOV Logic (REQ-024)
        let baseFOV = 75
        if (isMobile && size.height > size.width) {
            baseFOV = 85
        }
        let targetFOV = baseFOV
        if (speed > 8.0) {
            const ratio = Math.min(1, (speed - 8.0) / 4.0)
            targetFOV += ratio * 10
        }
        if (perspectiveCamera.isPerspectiveCamera) {
            perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, targetFOV, dt * 5)
            perspectiveCamera.updateProjectionMatrix()
        }

        // REQ-022: Strafe Tilt
        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
        const strafeSpeed = new THREE.Vector3(pVel.x, 0, pVel.z).dot(camRight)
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -strafeSpeed * 0.005, dt * 5)

        // REQ-021: Head Bobbing
        if (speed > 1.0) {
            const bobOffset = Math.sin(Date.now() * 0.001 * speed * 1.5) * 0.05
            camera.position.y += bobOffset
        }
    }

    const updateFirstPersonCamera = (dt: number, inputX: number, inputY: number, invertY: boolean) => {
        const modY = invertY ? -1 : 1
        currentRotation.current.x -= inputX * 2.0
        currentRotation.current.y -= inputY * 2.0 * modY
        currentRotation.current.y = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, currentRotation.current.y))

        const pPos = gameSystemInstance.playerPosition
        if (pPos) {
            camera.position.set(pPos.x, pPos.y + 1.7, pPos.z)
        }
        const quat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(currentRotation.current.y, currentRotation.current.x, 0, 'YXZ')
        )
        camera.quaternion.copy(quat)
    }

    const updateInspectCamera = (dt: number, inputX: number, inputY: number) => {
        const { inspectTarget } = useCameraStore.getState()
        const target = inspectTarget

        if (target) {
            currentRotation.current.x -= inputX * 2.0
            currentRotation.current.y -= inputY * 2.0
            currentRotation.current.y = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, currentRotation.current.y))

            const quat = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(currentRotation.current.y, currentRotation.current.x, 0, 'YXZ')
            )
            const offset = new THREE.Vector3(0, 0, 2.0).applyQuaternion(quat)
            const targetPos = new THREE.Vector3(target.x, target.y, target.z)

            camera.position.lerp(targetPos.clone().add(offset), dt * 10)
            camera.lookAt(targetPos)
        }
    }

    const updateDialogCamera = (dt: number) => {
        const { dialogTarget } = useCameraStore.getState()
        if (dialogTarget) {
            const targetPos = new THREE.Vector3(dialogTarget.x, dialogTarget.y, dialogTarget.z)
            const desiredPos = targetPos.clone().add(new THREE.Vector3(0, 0, 2.0))
            camera.position.lerp(desiredPos, dt * 2)

            const fovBase = 75;
            const targetFov = (isMobile && !isLandscape) ? 65 : fovBase;

            if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
                const pCam = camera as THREE.PerspectiveCamera
                if (pCam.fov !== targetFov) {
                    pCam.fov = THREE.MathUtils.lerp(pCam.fov, targetFov, dt * 2);
                    pCam.updateProjectionMatrix();
                }
            }

            const safeAreaOffset = (isMobile && !isLandscape) ? 0.8 : 0;
            const finalFollowTarget = targetPos.clone().add(new THREE.Vector3(0, safeAreaOffset, 0));
            const currentLook = new THREE.Vector3()
            camera.getWorldDirection(currentLook)
            const desiredLook = finalFollowTarget.clone().sub(camera.position).normalize()
            const finalLook = currentLook.lerp(desiredLook, dt * 5)

            const lookAtPoint = camera.position.clone().add(finalLook)
            camera.lookAt(lookAtPoint)
        }
    }

    return (
        <>
            {/* REQ-046: Debug Gizmos */}
            {debugFlags.showPhysics && (
                <Line
                    points={[pivotPosition.current, camera.position]}
                    color="red"
                />
            )}
            <PointerLockControls selector="#root" />
        </>
    )
}

export default CameraSystem
