import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// PH-026: Wind Influence
// A zone that applies a continuous force to objects inside it.

export const WindZone = ({ position, size = [10, 10, 10], force = [5, 0, 0] }: any) => {
    const windForce = new THREE.Vector3(...force)
    const objectsInZone = useRef<Set<RapierRigidBody>>(new Set())

    useFrame((state, delta) => {
        objectsInZone.current.forEach(rb => {
            if (rb && rb.isValid()) {
                // Apply force relative to mass? 
                // Wind affects lighter objects more?
                // applyImpulse is F * dt. applyForce is continuous.
                // We use applyImpulse for instantaneous steps or force for continuous.
                // Rapier recommend applyImpulse inside useFrame for continuous force? No, applyForce.
                // But applyForce serves as "add force for this step".
                rb.applyImpulse({
                    x: windForce.x * delta,
                    y: windForce.y * delta,
                    z: windForce.z * delta
                }, true)
                rb.wakeUp()
            }
        })
    })

    return (
        <group position={position}>
            {/* Visual Helper (optional, invisible in game usually) */}
            <mesh>
                <boxGeometry args={size} />
                <meshBasicMaterial color="cyan" transparent opacity={0.05} wireframe />
            </mesh>

            {/* Sensor */}
            <RigidBody type="fixed" colliders={false} sensor>
                <CuboidCollider
                    args={[size[0] / 2, size[1] / 2, size[2] / 2]}
                    onIntersectionEnter={(e) => objectsInZone.current.add(e.other.rigidBodyObject as unknown as RapierRigidBody)}
                    onIntersectionExit={(e) => objectsInZone.current.delete(e.other.rigidBodyObject as unknown as RapierRigidBody)}
                />
            </RigidBody>
        </group>
    )
}
