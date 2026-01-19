import React, { useRef } from 'react'
import { Box, Sphere } from '@react-three/drei'
import { RigidBody, useSphericalJoint, RapierRigidBody } from '@react-three/rapier'

// PH-019: Rope Physics
// Implements a rope using a chain of spherical joints.

const RopeSegment = ({ start, end, prevRef, rbRef, isFixed = false }: any) => {
    // If it's the first one and fixed, we don't need joint to prev? 
    // Or we attach to a fixed anchor.

    // Joint
    if (prevRef) {
        useSphericalJoint(prevRef, rbRef, [
            [0, -0.25, 0], // Bottom of prev
            [0, 0.25, 0]   // Top of curr
        ])
    }

    return (
        <RigidBody
            ref={rbRef}
            position={start}
            type={isFixed ? 'fixed' : 'dynamic'}
            colliders="hull"
            mass={0.1}
            linearDamping={0.5}
            angularDamping={0.5}
        >
            <Sphere args={[0.05]}>
                <meshStandardMaterial color="brown" />
            </Sphere>
            <Box args={[0.08, 0.5, 0.08]} position={[0, 0, 0]}>
                <meshStandardMaterial color="brown" />
            </Box>
        </RigidBody>
    )
}


export const Rope = ({ position, length = 10 }: { position: [number, number, number], length?: number }) => {
    const segmentCount = length
    const refs = useRef<React.RefObject<RapierRigidBody>[]>(Array.from({ length: segmentCount }).map(() => React.createRef()))

    return (
        <group position={position}>
            {/* Anchor */}
            <RigidBody type="fixed" ref={refs.current[0]} position={[0, 0, 0]} colliders="ball">
                <Sphere args={[0.2]}><meshStandardMaterial color="black" /></Sphere>
            </RigidBody>

            {Array.from({ length: segmentCount - 1 }).map((_, i) => (
                <RopeSegment
                    key={i}
                    rbRef={refs.current[i + 1]}
                    prevRef={refs.current[i]}
                    start={[0, -0.6 * (i + 1), 0]}
                />
            ))}
        </group>
    )
}
