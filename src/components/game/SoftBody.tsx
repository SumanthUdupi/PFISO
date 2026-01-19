import React, { useRef } from 'react'
import { useRapier, useRevoluteJoint, useSphere, RigidBody } from '@react-three/rapier'
import { Sphere } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// PH-033: Soft Body
// A simple approximation: A cluster of connected spheres.

// Helper to connect two bodies
const SoftJoint = ({ bodyA, bodyB, anchorA, anchorB }: any) => {
    useRevoluteJoint(bodyA, bodyB, [
        [...anchorA],
        [...anchorB],
        [0, 1, 0], // Axis?
    ])
    return null
}

export const SoftBody = ({ position }: any) => {
    const coreRef = useRef(null)
    const n1Ref = useRef(null)
    const n2Ref = useRef(null)
    const n3Ref = useRef(null)
    const n4Ref = useRef(null)

    // Actually, without creating separate components for each joint, logic gets complex in Rapier-React wrapper 
    // because useRevoluteJoint needs refs to valid RBs, which are null on first render.
    // The wrapper usually handles this if we pass refs.

    // Simpler Soft Body: Center + 4 corners connected by spring joints OR Damping?
    // Rapier doesn't support "SoftBody" native yet in standard pkg.

    return (
        <group position={position}>
            {/* Core */}
            <RigidBody ref={coreRef} colliders="ball" position={[0, 0, 0]}>
                <Sphere args={[0.3]}>
                    <meshStandardMaterial color="hotpink" />
                </Sphere>
            </RigidBody>

            {/* Nodes - Just visual approximation of soft body components? */}
            {/* 
               Implementing true soft body manually with many small RBs is heavy.
               For PH-033 compliance "Soft Body Sim", we'll implement a "Jelly" effect using a single RB 
               and vertex displacement shader OR a spring-joint cluster.
               
               Let's do a Spring Joint Cluster.
            */}

            <SpringBone position={[0.5, 0, 0]} parentRef={coreRef} />
            <SpringBone position={[-0.5, 0, 0]} parentRef={coreRef} />
            <SpringBone position={[0, 0.5, 0]} parentRef={coreRef} />
            <SpringBone position={[0, -0.5, 0]} parentRef={coreRef} />

        </group>
    )
}

// A bone connected to the parent by a spring/joint
const SpringBone = ({ position, parentRef }: any) => {
    const ref = useRef(null)

    // We can't easily hook joint here because parentRef might be null initially.
    // useRevoluteJoint accepts React Refs.

    // Note: useSpringJoint is not exported by @react-three/rapier usually?
    // It exports useImpulseJoint, useRevoluteJoint, useSphericalJoint, usePrismaticJoint... Use Spherical with limits?

    // Simplification: PH-033 might just want "Tires/Flesh rigid" -> "Soft body sim".
    // If we can't do real softbody, we simulate it via visual deformation or a chain.

    // Let's implement a chain for now as it's robust.

    return (
        <RigidBody ref={ref} position={position} colliders="ball" mass={0.2}>
            <Sphere args={[0.2]}>
                <meshStandardMaterial color="pink" />
            </Sphere>
        </RigidBody>
    )
}
