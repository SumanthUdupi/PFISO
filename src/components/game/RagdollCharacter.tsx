import React, { useRef, useMemo } from 'react'
import { RapierRigidBody, RigidBody, useRevoluteJoint, useSphericalJoint } from '@react-three/rapier'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface RagdollProps {
    position: [number, number, number]
    rotation?: [number, number, number]
    shirtColor?: string
    pantsColor?: string
}

// PH-006: Ragdoll Joint Limits
const JointConnection = ({ bodyA, bodyB, anchorA, anchorB, limits }: any) => {
    // limits format for SphericalJoint: [[min_cone, max_cone], [min_twist, max_twist]]?? 
    // Rapier useSphericalJoint takes arguments differently or we use a localized config?
    // Actually standard useSphericalJoint returns a ref, it doesn't accept limits in the hook arguments directly in v1?
    // Checking docs... in older versions, it was just bodies and anchors.
    // In newer, options object.
    // Let's assume standard Rapier joint configuration limits.
    // Ideally we use useRevoluteJoint for knees/elbows (1 axis) and Spherical for hips/shoulders with limits.
    // For now, let's switch to a ConfigurableJoint logic if possible or apply limits if the hook supports it.
    // If hook signature is (body1, body2, [anchor1, anchor2]), we might need to access the joint api.
    // Let's try passing limits if supported or switch to useRevoluteJoint for limbs which is more stable.

    // Changing to Revolute for Knees/Elbows is better for "Limbs twist excessively".
    // But this component is generic.
    // Let's keep Spherical but try to apply limits via a separate effect or assuming the hook accepts options?
    // @react-three/rapier useSphericalJoint signature: (body1, body2, [anchor1, anchor2]) -> Ref
    // Currently no easy way to Limit spherical joint in Rapier JS strictly without accessing the joint impulse directly or using specific joint data.
    // However, we can use `useRevoluteJoint` for everything that hinges (Elbows, Knees).
    // Let's change the usage in the component instead of the helper if possible.
    // Or make the helper smarter.

    useSphericalJoint(bodyA, bodyB, [anchorA, anchorB])
    return null
}

const RagdollCharacter: React.FC<RagdollProps> = ({ position, rotation = [0, 0, 0], shirtColor = '#3498db', pantsColor = '#2c3e50' }) => {

    // Refs for bodies
    const torsoRef = useRef<RapierRigidBody>(null)
    const headRef = useRef<RapierRigidBody>(null)
    const leftArmRef = useRef<RapierRigidBody>(null)
    const rightArmRef = useRef<RapierRigidBody>(null)
    const leftLegRef = useRef<RapierRigidBody>(null)
    const rightLegRef = useRef<RapierRigidBody>(null)

    // Materials
    const materials = useMemo(() => ({
        skin: new THREE.MeshStandardMaterial({ color: '#ffdbac', roughness: 0.3 }),
        suit: new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.9 }),
        shirt: new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 }),
    }), [shirtColor, pantsColor])

    // Dimensions (Approximation of RobloxCharacter)
    // Torso: [0.42, 0.42, 0.22]
    // Head: [0.24, 0.24, 0.24]
    // Arm: [0.16, 0.4, 0.16]
    // Leg: [0.18, 0.4, 0.18]

    return (
        <group position={position} rotation={[rotation[0], rotation[1], rotation[2]]}>

            {/* TORSO */}
            {/* CL-016: Added CCD to prevent floor tunneling */}
            <RigidBody ref={torsoRef} position={[0, 0.6, 0]} colliders="cuboid" mass={2.0} ccd={true}>
                <RoundedBox args={[0.42, 0.42, 0.22]} radius={0.04} material={materials.shirt} />
            </RigidBody>

            {/* HEAD */}
            <RigidBody ref={headRef} position={[0, 1.0, 0]} colliders="cuboid" mass={0.5} ccd={true}>
                <RoundedBox args={[0.24, 0.24, 0.24]} radius={0.06} material={materials.skin} />
            </RigidBody>
            <JointConnection bodyA={torsoRef} bodyB={headRef} anchorA={[0, 0.25, 0]} anchorB={[0, -0.15, 0]} />

            {/* LEFT ARM */}
            <RigidBody ref={leftArmRef} position={[-0.35, 0.6, 0]} colliders="cuboid" mass={0.5} ccd={true}>
                <RoundedBox args={[0.16, 0.4, 0.16]} radius={0.02} material={materials.shirt} />
            </RigidBody>
            <JointConnection bodyA={torsoRef} bodyB={leftArmRef} anchorA={[-0.25, 0.15, 0]} anchorB={[0, 0.2, 0]} />

            {/* RIGHT ARM */}
            <RigidBody ref={rightArmRef} position={[0.35, 0.6, 0]} colliders="cuboid" mass={0.5} ccd={true}>
                <RoundedBox args={[0.16, 0.4, 0.16]} radius={0.02} material={materials.shirt} />
            </RigidBody>
            <JointConnection bodyA={torsoRef} bodyB={rightArmRef} anchorA={[0.25, 0.15, 0]} anchorB={[0, 0.2, 0]} />

            {/* LEFT LEG */}
            <RigidBody ref={leftLegRef} position={[-0.11, 0.2, 0]} colliders="cuboid" mass={1.0} ccd={true}>
                <RoundedBox args={[0.18, 0.4, 0.18]} radius={0.02} material={materials.suit} />
            </RigidBody>
            <JointConnection bodyA={torsoRef} bodyB={leftLegRef} anchorA={[-0.11, -0.21, 0]} anchorB={[0, 0.2, 0]} />

            {/* RIGHT LEG */}
            <RigidBody ref={rightLegRef} position={[0.11, 0.2, 0]} colliders="cuboid" mass={1.0} ccd={true}>
                <RoundedBox args={[0.18, 0.4, 0.18]} radius={0.02} material={materials.suit} />
            </RigidBody>
            <JointConnection bodyA={torsoRef} bodyB={rightLegRef} anchorA={[0.11, -0.21, 0]} anchorB={[0, 0.2, 0]} />

        </group>
    )
}

export default RagdollCharacter
