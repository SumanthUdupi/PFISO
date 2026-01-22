import React, { useRef } from 'react'
import { CuboidCollider, RigidBody, useRapier } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import eventBus from '../../systems/EventBus'
import useAudioStore from '../../audioStore'

// PH-013: Buoyancy
// Applies upward force to objects inside.

interface WaterVolumeProps {
    position: [number, number, number]
    args: [number, number, number]
}

const WaterVolume: React.FC<WaterVolumeProps> = ({ position, args }) => {
    const { rapier, world } = useRapier()

    // We can use a sensor collider.
    // When object enters, we add it to a list.
    // In useFrame, we apply force to all objects in list.

    // Alternatively, Rapier has no built-in buoyancy controller in the React wrapper yet?
    // We'll implement a simple one.

    // Note: iterating all objects might be heavy. 
    // Optimization: Only affect Dynamic bodies.

    const internalSet = useRef<Set<any>>(new Set())

    useFrame((state, delta) => {
        internalSet.current.forEach(rb => {
            if (!rb || !rb.isValid()) {
                internalSet.current.delete(rb)
                return
            }

            // PH-028: Fluid Drag
            // F_drag = -k * v (Simplified linear drag)
            // Ideally k depends on viscosity and object area (simplified here)

            const velocity = rb.linvel()
            const angVel = rb.angvel()
            const mass = rb.mass()

            // Buoyancy Force: Counteract gravity + float
            // F = m * g * 1.2 (for floating)
            const buoyancyForce = mass * 9.81 * 1.2

            // Drag Factors
            const linearDragK = 2.0
            const angularDragK = 1.0

            // Apply Forces
            // 1. Buoyancy (Up)
            // 2. Linear Drag (Opposite to velocity)
            // 3. Angular Drag (Opposite to rotation)

            const dragForce = {
                x: -velocity.x * linearDragK * mass,
                y: -velocity.y * linearDragK * mass,
                z: -velocity.z * linearDragK * mass
            }

            const totalForce = {
                x: dragForce.x,
                y: buoyancyForce + dragForce.y,
                z: dragForce.z
            }

            // Apply Linear Force
            rb.applyImpulse({
                x: totalForce.x * delta,
                y: totalForce.y * delta,
                z: totalForce.z * delta
            }, true)

            // Apply Angular Drag (torque)
            // Torque = -angVel * k
            const torque = {
                x: -angVel.x * angularDragK * mass * delta,
                y: -angVel.y * angularDragK * mass * delta,
                z: -angVel.z * angularDragK * mass * delta
            }
            rb.applyTorqueImpulse(torque, true)

            rb.wakeUp()
        })
    })

    return (
        <group position={position}>
            {/* Visual */}
            <mesh>
                <boxGeometry args={args} />
                <meshStandardMaterial color="#4fc3f7" transparent opacity={0.5} />
            </mesh>

            <RigidBody type="fixed" colliders={false} sensor onIntersectionEnter={(e) => {
                // @ts-ignore
                if (e.other && e.other.rigidBodyObject) {
                    // @ts-ignore
                    internalSet.current.add(e.other.rigidBodyObject)

                    // @ts-ignore
                    const vel = e.other.linvel()
                    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)
                    if (speed > 2.0) {
                        // @ts-ignore
                        const contactPos = e.other.translation()
                        eventBus.emit('PARTICLE_SPAWN', {
                            type: 'WATER_SPLASH',
                            position: { x: contactPos.x, y: position[1] + args[1] / 2, z: contactPos.z }
                        })
                        useAudioStore.getState().playSound('splash_enter', { volume: Math.min(speed * 0.1, 1.0) })
                    }
                }
            }} onIntersectionExit={(e) => {
                // @ts-ignore
                if (e.other && e.other.rigidBodyObject) {
                    // @ts-ignore
                    internalSet.current.delete(e.other.rigidBodyObject)
                }
            }}>
                <CuboidCollider args={[args[0] / 2, args[1] / 2, args[2] / 2]} sensor />
            </RigidBody>
        </group>
    )
}

export default WaterVolume
