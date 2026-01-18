import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import eventBus from '../../systems/EventBus'
import * as THREE from 'three'

const CameraShake = () => {
    const { camera } = useThree()
    const trauma = useRef(0)
    const decay = 0.5 // Trauma decay per second
    const maxAngle = 0.05 // Max rotation in radians
    const maxOffset = 0.2 // Max position offset
    const timeRef = useRef(0)

    // Noise function (simple pseudo-random for now, or simplex if available)
    // We'll use a simple sin/cos mix for determinism and speed
    const getNoise = (seed: number) => {
        return (Math.sin(seed * 10) + Math.cos(seed * 20) * 0.5)
    }

    const impulse = useRef(new THREE.Vector3())

    useEffect(() => {
        const onShake = (payload: any) => {
            // Add trauma, clamped to 1
            const amount = payload.intensity || 0.5
            trauma.current = THREE.MathUtils.clamp(trauma.current + amount, 0, 1)

            // REQ-031: Directional Impulse
            if (payload.direction) {
                // Add direction vector (normalized) * amount
                const dir = payload.direction instanceof THREE.Vector3 ? payload.direction : new THREE.Vector3(payload.direction.x, payload.direction.y, payload.direction.z)
                impulse.current.add(dir.normalize().multiplyScalar(amount * 0.5))
            }
        }

        eventBus.on('SCREEN_SHAKE', onShake)
        return () => {
            eventBus.off('SCREEN_SHAKE', onShake)
        }
    }, [])

    useFrame((_state, delta) => {
        if (trauma.current > 0) {
            // Decay
            trauma.current = Math.max(0, trauma.current - decay * delta)

            // Decay impulse
            impulse.current.lerp(new THREE.Vector3(0, 0, 0), delta * 5)

            // Shake = Trauma^2 or ^3 for better feel
            const shake = trauma.current * trauma.current

            timeRef.current += delta * 15 // Speed of shake

            // Calculate offsets
            const yaw = maxAngle * shake * getNoise(timeRef.current)
            const pitch = maxAngle * shake * getNoise(timeRef.current + 100)
            const roll = maxAngle * shake * getNoise(timeRef.current + 200)

            const x = maxOffset * shake * getNoise(timeRef.current + 300) + impulse.current.x * shake
            const y = maxOffset * shake * getNoise(timeRef.current + 400) + impulse.current.y * shake
            const z = maxOffset * shake * getNoise(timeRef.current + 500) + impulse.current.z * shake

            // Apply to camera
            // Note: If camera is controlled by orbit controls or player, we might need a parent group or additive apply.
            // Since Player.tsx controls camera position every frame, we should strictly apply this ADDITIVELY 
            // OR wrap the camera in a <group> and shake the group. 
            // However, R3F cameras are usually at root.
            // Let's try direct modification *after* player update. 
            // Player.tsx uses useFrame. If we run this useFrame *after*, it effectively adds on top 
            // BUT Player sets position absolute.

            // BETTER APPROACH: Player.tsx should probably have a "shakeOffset" vector that we write to?
            // OR this component modifies the camera's *view* directly?
            // "Camera Shake" is often best done by nesting: CameraRig -> CameraShaker -> Camera.
            // But our structure is flat.

            // Quickest clean way: 
            // We can modify the camera position/rotation HERE, but we must ensure it runs AFTER Player.
            // R3F useFrame default priority is 0. Player likely 0.
            // We can set priority to 1.

            camera.rotation.x += pitch
            camera.rotation.y += yaw
            camera.rotation.z += roll
            camera.position.x += x
            camera.position.y += y
            camera.position.z += z
        }
    })

    return null
}

export default CameraShake
