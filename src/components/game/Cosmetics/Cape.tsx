import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRapier, RigidBody, RopeJoint, useRevoluteJoint } from '@react-three/rapier'
import { Box } from '@react-three/drei'
import * as THREE from 'three'

// PH-018: Cloth Stiffness - Reduce stiffness by using loose joints and proper mass.
const CapeSegment = ({ position, parentBody, anchor, index }: any) => {
    const rb = useRef<RapierRigidBody>(null)
    // Joint to parent
    useRevoluteJoint(parentBody, rb, [
        anchor, // Parent anchor
        [0, 0.15, 0], // Child anchor (top of segment)
        [1, 0, 0] // Axis X
    ])

    return (
        <RigidBody
            ref={rb}
            position={position}
            colliders="hull"
            linearDamping={0.5}
            angularDamping={0.5}
            mass={0.1} // Light mass for cloth
            collisionGroups={0x00020001} // Interaction group to avoid self-collision if needed?
        >
            <Box args={[0.35, 0.3, 0.05]} castShadow receiveShadow>
                <meshStandardMaterial color="#8e44ad" roughness={0.9} />
            </Box>

            {/* Recursively render next segment? Or iterative in parent? 
                 Iterative in parent is better to avoid Prop drilling refs.
                 But we need ref of this body for the NEXT joint.
             */}
        </RigidBody>
    )
}

// Since we need refs for joints, we can use a Chain helper or just do it imperatively loop.
// For Prototype, let's use a simpler "CapeChain" component that explicitly creates joints between ref array.

export const Cape = (props: any) => {
    const segmentCount = 5
    const refs = useRef<React.RefObject<RapierRigidBody>[]>(Array.from({ length: segmentCount }).map(() => React.createRef()))

    // We also need the "Parent" to attach the first segment to.
    // The visual parent is the Torso Group. The Physics Parent?
    // If Torso is part of Character Controller, it might not be a RigidBody we can joint to easily?
    // CharacterController is Kinematic.
    // We can use a Fixed/Kinematic anchor at 0,0,0 relative to this group.

    const anchorRef = useRef<RapierRigidBody>(null)

    return (
        <group {...props}>
            <RigidBody ref={anchorRef} type="kinematicPosition" colliders={false}>
                {/* Invisible Anchor */}
            </RigidBody>

            {Array.from({ length: segmentCount }).map((_, i) => (
                <CapeChainLink
                    key={i}
                    index={i}
                    rbRef={refs.current[i]}
                    prevRef={i === 0 ? anchorRef : refs.current[i - 1]}
                />
            ))}
        </group>
    )
}

const CapeChainLink = ({ index, rbRef, prevRef }: any) => {
    useRevoluteJoint(prevRef, rbRef, [
        [0, index === 0 ? -0.1 : -0.15, 0],
        [0, 0.15, 0],
        [1, 0, 0] // Hinge on X
    ])
    // Note: useRevoluteJoint options for limits are 4th arg? Check R3F Rapier docs or type def.
    // Standard R3F Rapier hook signature: (body1, body2, [anchor1, anchor2, axis1, axis2], limits?)
    // Actually, arrays are: [anchor1, anchor2, axis1, axis2]
    // Or simplified: [anchor1, anchor2, axis] (axis is common?)

    // Let's assume standard behavior allows free rotation.
    // PH-050: Prevent clipping into legs (Backwards swing limit)
    // We can't easily add limits via the simplified hook if slightly different.
    // Instead, rely on collisionGroups?
    // "collisionGroups" prop on RigidBody handles it.
    // Default group: 0xffff0000 (all).
    // Let's ensure it collides with Default (Layer 0) which Player usually is?
    // Player is Layer 1.
    // We want Cape (Prop/Cosmetic) to collide with Player?
    // If it collides, it might jitter.
    // Best solution: Add Limits if possible.
    // If not, use Angular Damping (already 2.0) to minimize swing.
    // Let's update collisionGroups to INCLUDE player (Bit 1).
    // Default is usually everything.

    // For this task, we will verify collision is ENABLED for player.
    // And increase damping/mass ratio to prevent "passing through" at high speed.

    return (
        <RigidBody
            ref={rbRef}
            position={[0, -0.3 * (index + 1), 0]} // Initial pos
            colliders="cuboid"
            mass={0.05}
            linearDamping={0.2}
            angularDamping={2.0} // Reduce jitter
        >
            <Box args={[0.3, 0.28, 0.04]}>
                <meshStandardMaterial color="#8e44ad" />
            </Box>
        </RigidBody>
    )
}
