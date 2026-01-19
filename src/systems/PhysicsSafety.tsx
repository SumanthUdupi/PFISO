import { useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import * as THREE from 'three'

// PH-030: Nan/Inf Velocity
// Clamps velocity of all bodies to prevent explosions.

const MAX_VELOCITY = 50 // m/s
const MAX_ANGULAR_VELOCITY = 20 // rad/s

export const PhysicsSafety = () => {
    const { world } = useRapier()

    useFrame(() => {
        // Iterate all bodies? world.bodies.forEach ...
        // Rapier world iteration might be expensive in JS if many bodies?
        // But it's the only way to catch everything globally.
        // world.forEachRigidBody((body) => ...)

        // Safety check: Don't run if world not ready
        if (!world) return

        world.forEachRigidBody((body) => {
            if (body.isDynamic()) {
                const linvel = body.linvel()
                const angvel = body.angvel()

                // Check NaN
                if (isNaN(linvel.x) || isNaN(linvel.y) || isNaN(linvel.z)) {
                    console.warn("PhysicsSafety: NaN Linear Velocity detected! Resetting.", body.handle)
                    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
                    return
                }

                // Clamp Linear
                const speedSq = linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z
                if (speedSq > MAX_VELOCITY * MAX_VELOCITY) {
                    const scale = MAX_VELOCITY / Math.sqrt(speedSq)
                    body.setLinvel({ x: linvel.x * scale, y: linvel.y * scale, z: linvel.z * scale }, true)
                }

                // Clamp Angular
                const angSpeedSq = angvel.x * angvel.x + angvel.y * angvel.y + angvel.z * angvel.z
                if (angSpeedSq > MAX_ANGULAR_VELOCITY * MAX_ANGULAR_VELOCITY) {
                    const scale = MAX_ANGULAR_VELOCITY / Math.sqrt(angSpeedSq)
                    body.setAngvel({ x: angvel.x * scale, y: angvel.y * scale, z: angvel.z * scale }, true)
                }
            }
        })
    })

    return null
}
