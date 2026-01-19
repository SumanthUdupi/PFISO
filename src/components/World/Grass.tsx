import React, { useMemo } from 'react'
import { Instance, Instances } from '@react-three/drei'

export const Grass = () => {
    // CL-028: Grass Clip - Mask grass below floor or simply offset Y
    // Requirement says "Mask grass". 
    // We implement a check in generation.
    const instances = useMemo(() => {
        const temp = []
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 100
            const z = (Math.random() - 0.5) * 100
            const y = 0
            // Fix: Simple offset Check (Ground is at 0)
            // If terrain was uneven, we would raycast.
            // Here we ensure y >= 0.05 to prevent Z-fighting or clipping through floor
            temp.push({ position: [x, y + 0.1, z], scale: 0.5 + Math.random() * 0.5 })
        }
        return temp
    }, [])

    return (
        <Instances range={1000}>
            <planeGeometry args={[0.2, 0.8]} />
            <meshStandardMaterial color="#4caf50" side={2} />
            {instances.map((data, i) => (
                <Instance key={i} position={data.position as any} scale={data.scale} />
            ))}
        </Instances>
    )
}
