import React, { useRef, useMemo, useState } from 'react'
import { RigidBody, useSphericalJoint, CylinderCollider } from '@react-three/rapier'
import { Cylinder } from '@react-three/drei'
import * as THREE from 'three'

// PH-041: Chain Physics
// Helper component for a single link
const ChainLink = ({ position, rotation, parentRef }: any) => {
    const ref = useRef(null)

    // Connect to parent
    useSphericalJoint(parentRef, ref, [
        [0, -0.25, 0], // Anchor A (Parent bottom)
        [0, 0.25, 0],  // Anchor B (Self top)
    ])

    return (
        <RigidBody ref={ref} position={position} rotation={rotation} colliders="hull" linearDamping={0.5} angularDamping={0.5}>
            <Cylinder args={[0.05, 0.05, 0.5]}>
                <meshStandardMaterial color="silver" />
            </Cylinder>
        </RigidBody>
    )
}

// Chain Spawner
// Note: recursive or iterative generation of joints in Rapier/Fiber can be tricky with hooks.
// We'll create a fixed chain of 5 links for now as a prop.

// Breakdown of PhysicsChain to support "Breaking" (PH-046)
// We replace the static hooks with a component-based approach where each link manages its joint.

const BreakableLink = ({ position, parentRef, anchorA, anchorB, index }: any) => {
    const rb = useRef<RapierRigidBody>(null)
    const [isBroken, setIsBroken] = useState(false)

    // Check for break condition
    useFrame(() => {
        if (!rb.current || !parentRef.current || isBroken) return

        // PH-046: Joint Breaking
        // Simple distance check: if link stretches too far from parent anchor, snap it.
        // World position of parent anchor vs self anchor?
        // Let's just check center-to-center distance vs expected length.
        const myPos = rb.current.translation()
        const parentPos = parentRef.current.translation()
        const dist = Math.sqrt(
            (myPos.x - parentPos.x) ** 2 +
            (myPos.y - parentPos.y) ** 2 +
            (myPos.z - parentPos.z) ** 2
        )

        // Expected dist is roughly 0.6. Break at 1.2
        if (dist > 1.2) {
            setIsBroken(true)
            // Ideally play a sound here
        }
    })

    return (
        <>
            <RigidBody ref={rb} position={position} colliders={false} linearDamping={0.5} angularDamping={0.5}>
                <CylinderCollider args={[0.25, 0.05]} />
                <Cylinder args={[0.05, 0.05, 0.5]}>
                    <meshStandardMaterial color={isBroken ? "red" : "silver"} />
                </Cylinder>
            </RigidBody>

            {/* Conditional Joint */}
            {!isBroken && (
                <ChainJoint body1={parentRef} body2={rb} anchor1={anchorA} anchor2={anchorB} />
            )}

            {/* Recursively create next link? Or Flattened list? 
                Flattened list in parent is better. But we need ref to THIS body.
                We can expose ref via React.forwardRef or just pass a callback?
                For simplicity, let's keep the chain static length in Parent but pass refs.
            */}
        </>
    )
}

// Isolated Joint Component
const ChainJoint = ({ body1, body2, anchor1, anchor2 }: any) => {
    useSphericalJoint(body1, body2, [anchor1, anchor2])
    return null
}

export const PhysicsChain = ({ position }: any) => {
    const fixedAnchor = useRef<RapierRigidBody>(null)

    // We need refs for the links to chain them
    const link1 = useRef<RapierRigidBody>(null)
    const link2 = useRef<RapierRigidBody>(null)
    const link3 = useRef<RapierRigidBody>(null)
    const link4 = useRef<RapierRigidBody>(null)
    const link5 = useRef<RapierRigidBody>(null)

    return (
        <group position={position}>
            {/* Base */}
            <RigidBody ref={fixedAnchor} type="fixed" colliders="ball">
                <mesh>
                    <sphereGeometry args={[0.2]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </RigidBody>

            {/* Links with explicit breaking support */}
            <BreakableLinkRef ref={link1} position={[0, -0.6, 0]} parentRef={fixedAnchor} anchorA={[0, -0.1, 0]} anchorB={[0, 0.3, 0]} />
            <BreakableLinkRef ref={link2} position={[0, -1.2, 0]} parentRef={link1} anchorA={[0, -0.3, 0]} anchorB={[0, 0.3, 0]} />
            <BreakableLinkRef ref={link3} position={[0, -1.8, 0]} parentRef={link2} anchorA={[0, -0.3, 0]} anchorB={[0, 0.3, 0]} />
            <BreakableLinkRef ref={link4} position={[0, -2.4, 0]} parentRef={link3} anchorA={[0, -0.3, 0]} anchorB={[0, 0.3, 0]} />
            <BreakableLinkRef ref={link5} position={[0, -3.0, 0]} parentRef={link4} anchorA={[0, -0.3, 0]} anchorB={[0, 0.3, 0]} />
        </group>
    )
}

// Wrapper to handle Ref forwarding for the links
const BreakableLinkRef = React.forwardRef((props: any, ref: any) => {
    const [isBroken, setIsBroken] = useState(false)
    const internalRef = useRef<RapierRigidBody>(null)

    // Sync external ref
    React.useImperativeHandle(ref, () => internalRef.current)

    // Check for break condition
    useFrame(() => {
        if (!internalRef.current || !props.parentRef.current || isBroken) return

        const myPos = internalRef.current.translation()
        const parentPos = props.parentRef.current.translation()
        const dist = Math.sqrt(
            (myPos.x - parentPos.x) ** 2 +
            (myPos.y - parentPos.y) ** 2 +
            (myPos.z - parentPos.z) ** 2
        )

        if (dist > 1.2) {
            setIsBroken(true)
        }
    })

    return (
        <>
            <RigidBody ref={internalRef} position={props.position} colliders={false} linearDamping={0.5} angularDamping={0.5} restitution={0.2}>
                <CylinderCollider args={[0.25, 0.05]} />
                <Cylinder args={[0.05, 0.05, 0.5]}>
                    <meshStandardMaterial color={isBroken ? "orange" : "silver"} />
                </Cylinder>
            </RigidBody>
            {!isBroken && (
                <ChainJoint body1={props.parentRef} body2={internalRef} anchor1={props.anchorA} anchor2={props.anchorB} />
            )}
        </>
    )
})
