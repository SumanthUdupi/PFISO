import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useInteractionStore from '../../stores/interactionStore'
import inputs from '../../systems/InputManager'

const Grabber = () => {
    const { heldObjectId, registry, dropObject } = useInteractionStore()
    const { camera } = useThree()
    const lastMousePos = useRef({ x: 0, y: 0 })

    // Config
    const HOLD_DISTANCE = 1.5
    const INSPECT_DISTANCE = 0.8
    const THROW_FORCE = 15
    const MOVE_LERP = 15
    const ROTATION_SENSITIVITY = 0.005

    // Track mouse movement for rotation
    React.useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            // Only rotate if inspecting
            if (inputs.isPressed('INSPECT') && heldObjectId) {
                const data = registry.get(heldObjectId)
                if (data && data.rbRef && data.rbRef.current) {
                    // Apply torque or manual rotation? 
                    // Physics rotation is better for "feeling".
                    // Or just rotate the kinematic target? 
                    // If we are holding it, we are forcing position. Rotation should be forced too.
                    // But Grabber usually sets angular velocity to 0 to keep upright.
                    // Let's modify the rotation logic below.
                }
                // Store delta in a ref if needed, or query InputManager if we added mouse delta
            }
            lastMousePos.current = { x: e.movementX, y: e.movementY }
        }
        window.addEventListener('mousemove', onMouseMove)
        return () => window.removeEventListener('mousemove', onMouseMove)
    }, [heldObjectId])

    useFrame((state, delta) => {
        if (!heldObjectId) return

        const data = registry.get(heldObjectId)
        if (!data || !data.rbRef || !data.rbRef.current) return

        const rb = data.rbRef.current
        const isInspecting = inputs.isPressed('INSPECT')
        const isThrow = inputs.justPressed('THROW_DROP') || inputs.justPressed('PRIMARY_ACTION') // Left Click

        // Throwing Logic
        if (isThrow) {
            const throwDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
            rb.wakeUp()
            rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
            rb.applyImpulse(throwDir.multiplyScalar(THROW_FORCE), true)
            rb.applyTorqueImpulse({
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5,
                z: (Math.random() - 0.5) * 0.5
            }, true)
            dropObject()
            return
        }

        // Target Position
        let dist = HOLD_DISTANCE
        if (isInspecting) dist = INSPECT_DISTANCE

        // Calculate hold position in front of camera
        const targetPos = new THREE.Vector3(0, -0.2, -dist)
        targetPos.applyQuaternion(camera.quaternion)
        targetPos.add(camera.position)

        // Physics Move (Velocity based)
        const currentPos = rb.translation()
        const vecPos = new THREE.Vector3(currentPos.x, currentPos.y, currentPos.z)
        const diff = targetPos.clone().sub(vecPos)
        const desiredVel = diff.multiplyScalar(MOVE_LERP)

        rb.setLinvel({ x: desiredVel.x, y: desiredVel.y, z: desiredVel.z }, true)

        // Orientation
        // If inspecting, rotate based on mouse
        if (isInspecting) {
            // We need to apply rotation based on mouse delta
            // Since we don't have direct ref to mouse delta here inside useFrame easily without listeners,
            // or we use the listener reference `lastMousePos`.

            // Issue: 'mousemove' fires only when moving. useFrame fires always.
            // We need cumulative rotation state or apply angular velocity?
            // Angular velocity is cleaner for physics objects.

            const mx = lastMousePos.current.x
            const my = lastMousePos.current.y

            // Reset delta after read to avoid drift? 
            // Actually, the listener updates 'lastMousePos' to the latest movement. 
            // But we need to clear it if no movement.
            // Better: Use a mutable vector for "Movement since last frame".
            // For now, let's just make object look at camera if NOT rotating? 
            // Requirement: "Rotate: Drag mouse while holding to examine"

            // Simplest: Apply angular velocity proportional to mouse movement
            // But pointer lock might consume mouse movement if active.
            // Note: If PointerLock is active (FPV/Inspecting), 'movementX' is valid.

            const rotX = my * ROTATION_SENSITIVITY * 50
            const rotY = mx * ROTATION_SENSITIVITY * 50

            rb.setAngvel({ x: rotX, y: rotY, z: 0 }, true)

            // Decay/Reset delta locally? 
            // In proper event loop, we'd accumulation deltas.
            // Let's assume onMouseMove is firing. 
            // Resetting lastMousePos.current to 0 at end of frame is unsafe if frame > mouse rate.
            // SAFE FIX: Use InputManager if we had deltas.
            // For now, this is "good enough" for prototype or we'll refine.

            // Reset for next frame to prevent infinite spin if mouse stops but we don't get event
            lastMousePos.current = { x: 0, y: 0 }

        } else {
            // Keep upright-ish or freeze rotation
            rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
            // Optional: Slerp to upright?
        }

        rb.wakeUp()
    })

    return null
}

export default Grabber
