import React, { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface LODGroupProps {
    levels: React.ReactNode[]
    distances: number[] // e.g. [10, 20] -> Level 0 < 10, Level 1 < 20, Level 2 > 20
    position: [number, number, number] | THREE.Vector3
}

export const LODGroup: React.FC<LODGroupProps> = ({ levels, distances, position }) => {
    const { camera } = useThree()
    const [levelIndex, setLevelIndex] = useState(0)

    // Performance: Only update every N frames
    const frameCount = useRef(0)
    const updateFrequency = 10

    const posVector = useMemo(() => {
        return Array.isArray(position) ? new THREE.Vector3(...position) : position
    }, [position])

    useFrame(() => {
        frameCount.current += 1
        if (frameCount.current % updateFrequency !== 0) return

        const dist = camera.position.distanceTo(posVector)

        // Find appropriate level
        let newIndex = levels.length - 1
        for (let i = 0; i < distances.length; i++) {
            if (dist < distances[i]) {
                newIndex = i
                break
            }
        }

        if (newIndex !== levelIndex) {
            setLevelIndex(newIndex)
        }
    })

    return (
        <group position={Array.isArray(position) ? undefined : undefined}>
            {/* Position is usually handled by parent container if this is just logic switch, 
               but typically LODGroup replaces the Mesh. 
               The parent probably positions this Group.
               We just return the specific level's content.
           */}
            {levels[levelIndex]}
        </group>
    )
}
