import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// PH-029: Magnetism
// Inverse square law attraction.

export const Magnet = ({ position, range = 5, strength = 50 }: any) => {
    const objectsInRange = useRef<Set<RapierRigidBody>>(new Set())
    const magnetPos = new THREE.Vector3(...position)

    useFrame((state, delta) => {
        objectsInRange.current.forEach(rb => {
            if (rb && rb.isValid()) {
                const objectPos = new THREE.Vector3()
                objectPos.copy(rb.translation() as THREE.Vector3)

                const direction = new THREE.Vector3().subVectors(magnetPos, objectPos)
                const distance = direction.length()

                if (distance > 0.1 && distance < range) {
                    direction.normalize()

                    // F = k / r^2
                    // Clamp distance to avoid infinite force at 0
                    const clampedDist = Math.max(distance, 0.5)
                    const forceMagnitude = strength / (clampedDist * clampedDist)

                    rb.applyImpulse({
                        x: direction.x * forceMagnitude * delta,
                        y: direction.y * forceMagnitude * delta,
                        z: direction.z * forceMagnitude * delta
                    }, true)
                    rb.wakeUp()
                }
            }
        })
    })

    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
            </mesh>

            <RigidBody type="fixed" colliders={false} sensor>
                <BallCollider
                    args={[range]}
                    onIntersectionEnter={(e) => {
                         if (e.other && e.other.rigidBody) objectsInRange.current.add(e.other.rigidBody)
                    }}
                    onIntersectionExit={(e) => {
                         if (e.other && e.other.rigidBody) objectsInRange.current.delete(e.other.rigidBody)
                    }}
                />
            </RigidBody>
        </group>
    )
}
