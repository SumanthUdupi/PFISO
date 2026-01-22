import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// PH-022: Conveyor Physics
// A static body with a sensor that pushes objects.

export const ConveyorBelt = ({ position, size = [2, 0.2, 5], speed = 2, direction = [0, 0, -1] }: any) => {
    const dir = new THREE.Vector3(...direction).normalize()
    // Objects currently on the belt
    const objectsOnBelt = useRef<Set<RapierRigidBody>>(new Set())

    useFrame((state, delta) => {
        // Apply velocity/force to all objects on belt
        objectsOnBelt.current.forEach(rb => {
            if (rb && rb.isValid()) {
                // Option A: Set velocity (Direct control)
                // rb.setLinvel({ x: dir.x * speed, y: rb.linvel().y, z: dir.z * speed }, true)

                // Option B: Apply force (More physical, allows stacking)
                // However, simple friction is usually enough if we move the kinematic body? 
                // But this requirement specifically says "Velocity drive" implying active pushing.

                // Let's force linear velocity modification for reliable "Conveyor" feel
                // But preserve Y velocity for gravity.
                const currentVel = rb.linvel()
                // Lerp towards target speed?
                const targetX = dir.x * speed
                const targetZ = dir.z * speed

                // Softly correct velocity (simulate friction)
                const lerpFactor = 5.0 * delta
                const newX = THREE.MathUtils.lerp(currentVel.x, targetX, lerpFactor)
                const newZ = THREE.MathUtils.lerp(currentVel.z, targetZ, lerpFactor)

                rb.setLinvel({ x: newX, y: currentVel.y, z: newZ }, true)
                rb.wakeUp()
            }
        })
    })

    return (
        <group position={position}>
            {/* Visual */}
            <mesh receiveShadow>
                <boxGeometry args={size} />
                <meshStandardMaterial map={null} color="#444" >
                    {/* Animate texture offset here in future for visual feedback */}
                </meshStandardMaterial>
            </mesh>

            {/* Physics Body - Static base so it doesn't fall */}
            <RigidBody type="fixed" colliders="cuboid" friction={0}>
                {/* Physical collider for standing on */}
                <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />

                {/* Sensor for detection just above surface */}
                <CuboidCollider
                    args={[size[0] / 2, 0.1, size[2] / 2]}
                    position={[0, size[1] / 2 + 0.05, 0]}
                    sensor
                    onIntersectionEnter={(payload) => {
                        if (payload.other && payload.other.rigidBody) objectsOnBelt.current.add(payload.other.rigidBody)
                    }}
                    onIntersectionExit={(payload) => {
                        if (payload.other && payload.other.rigidBody) objectsOnBelt.current.delete(payload.other.rigidBody)
                    }}
                />
            </RigidBody>
        </group>
    )
}
