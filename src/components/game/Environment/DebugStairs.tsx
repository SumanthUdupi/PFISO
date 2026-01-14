import React from 'react'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const DebugStairs = ({ position = [0, 0, 0] }) => {
    const steps = []
    const stepCount = 8
    const stepWidth = 2
    const stepHeight = 0.25
    const stepDepth = 0.5

    for (let i = 0; i < stepCount; i++) {
        steps.push(
            <RigidBody
                key={i}
                type="fixed"
                position={[0, i * stepHeight, i * stepDepth]}
                colliders="cuboid"
            >
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[stepWidth, stepHeight, stepDepth]} />
                    <meshStandardMaterial color={i % 2 === 0 ? "#ff5555" : "#ffaaaa"} />
                </mesh>
            </RigidBody>
        )
    }

    return (
        <group position={position as [number, number, number]}>
            {/* Visual Label */}
            <mesh position={[0, stepCount * stepHeight + 0.5, stepCount * stepDepth / 2]}>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                {/* Text would be better but simple colored blocks work for now */}
            </mesh>
            {steps}

            {/* A platform at the top */}
            <RigidBody type="fixed" position={[0, stepCount * stepHeight, stepCount * stepDepth + 1]}>
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[4, 0.2, 4]} />
                    <meshStandardMaterial color="#44ff44" />
                </mesh>
            </RigidBody>
        </group>
    )
}

export default DebugStairs
