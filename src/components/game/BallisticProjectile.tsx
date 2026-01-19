import React, { useRef, useEffect } from 'react'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import { Sphere } from '@react-three/drei'

// PH-038: Bullet Ballistics
// Dynamic projectile with gravity drop

export const BallisticProjectile = ({ position, velocity }: { position: [number, number, number], velocity: [number, number, number] }) => {
    const rb = useRef<RapierRigidBody>(null)

    useEffect(() => {
        if (rb.current) {
            rb.current.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true)
        }
    }, [])

    return (
        <RigidBody
            ref={rb}
            position={position}
            colliders="ball"
            ccd={true} // High speed needs CCD
            mass={0.05}
        >
            <Sphere args={[0.05]}>
                <meshStandardMaterial color="gold" emissive="orange" emissiveIntensity={2} />
            </Sphere>
        </RigidBody>
    )
}
