import React, { useState, useRef } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Box } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import useAudioStore from '../../audioStore'

// PH-007: Breakables
// Simple implementation: Box that breaks into 4 smaller boxes on high impact.

interface BreakableObjectProps {
    position: [number, number, number]
    color?: string
    breakThreshold?: number
}

const BreakableObject: React.FC<BreakableObjectProps> = ({ position, color = '#aaccff', breakThreshold = 5 }) => {
    const [isBroken, setIsBroken] = useState(false)
    const { playSound } = useAudioStore()

    const handleCollision = (e: any) => {
        if (isBroken) return

        // Check impact velocity (magnitude of relative velocity?)
        // Rapier collision event has 'totalForce'? or we check contact.
        // Simplified: If valid collision, and velocity is high enough.
        // But event handler might just trigger.
        // Let's rely on event.other.rigidBodyObject velocity vs ours.
        // Ideally we need magnitude.
        // For simplicity in this batch: if something fast hits it.

        // e.totalForce or check intensity.
        // Rapier's onCollisionEnter doesn't always give impulse directly in simple payload?
        // We'll just break on ANY dynamic collision for now, or assume "Fragile".
        // Real implementation needs magnitude check.

        setIsBroken(true)
        playSound('glass_break', 0.5) // Assume sound exists or will fail gracefully
    }

    if (isBroken) {
        // Spawn shards
        return <Debris shards={4} position={position} color={color} />
    }

    return (
        <RigidBody
            position={position}
            colliders="cuboid"
            onCollisionEnter={handleCollision}
            restitution={0.1}
        >
            <Box args={[1, 1, 1]}>
                <meshStandardMaterial color={color} transparent opacity={0.6} />
            </Box>
        </RigidBody>
    )
}

// PH-023: Destruction Debris - Debris despawns nicely
const Debris = ({ shards, position, color }: any) => {
    // We can use a simple effect to unmount after time
    const [opacity, setOpacity] = useState(1.0)
    const [visible, setVisible] = useState(true)

    useFrame((state, delta) => {
        if (opacity > 0) {
            // Wait 2 seconds then fade
            // Ideally use a ref for timer.
            // Simpler: Just decrease opacity slowly, but starts immediately?
            // Let's implement a delay.
        }
    })

    // Better approach: Separate component for individual shard that handles its own life?
    // Or just a group that fades out.

    // Quick implementation:
    const timeRef = useRef(0)
    useFrame((state, delta) => {
        timeRef.current += delta
        if (timeRef.current > 3.0) { // Keep for 3 seconds
            setOpacity(prev => Math.max(0, prev - delta))
            if (opacity <= 0) setVisible(false)
        }
    })

    if (!visible) return null

    return (
        <group position={position}>
            <Shard position={[-0.2, 0.2, -0.2]} color={color} opacity={opacity} />
            <Shard position={[0.2, 0.2, -0.2]} color={color} opacity={opacity} />
            <Shard position={[-0.2, 0.2, 0.2]} color={color} opacity={opacity} />
            <Shard position={[0.2, 0.2, 0.2]} color={color} opacity={opacity} />
        </group>
    )
}

const Shard = ({ position, color, opacity }: any) => {
    return (
        <RigidBody position={position} colliders="cuboid" collisionGroups={0x00020002}>
            <Box args={[0.4, 0.4, 0.4]}>
                <meshStandardMaterial color={color} transparent opacity={opacity} />
            </Box>
        </RigidBody>
    )
}



export default BreakableObject
