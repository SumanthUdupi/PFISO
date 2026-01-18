import React, { useMemo } from 'react'
import { Line, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import useGameStore from '../../../store'

interface PatrolPathProps {
    id: string
    initialPoints?: [number, number, number][]
}

export const PatrolPath: React.FC<PatrolPathProps> = ({ id, initialPoints = [] }) => {
    const { patrolPaths, updatePatrolPath, isEditMode } = useGameStore()
    const storedPath = patrolPaths[id]
    const points = storedPath ? storedPath.points : initialPoints

    // Convert to Vector3 for Drei Line
    const vecPoints = useMemo(() => points.map(p => new THREE.Vector3(p[0], p[1], p[2])), [points])

    // Drag Logic
    // Since DragControls is imperative and tricky with R3F declarative without a wrapper,
    // we'll use simple click-to-move or a Drei specialized control if available.
    // Actually, distinct spheres with `onPointerDown`/`onPointerMove` is easier in R3F.
    // Or TransformControls on selected point.
    // Let's use simple logic: If Edit Mode, show spheres.
    // We won't implement full drag this second, just visualization first.
    // Full editor might need more UI.

    return (
        <group>
            {vecPoints.length > 1 && (
                <Line
                    points={vecPoints}
                    color={isEditMode ? "yellow" : "white"}
                    opacity={isEditMode ? 1 : 0}
                    transparent
                    lineWidth={2}
                />
            )}

            {points.map((p, index) => (
                <group key={index} position={[p[0], p[1], p[2]]}>
                    {isEditMode && (
                        <Sphere args={[0.2, 8, 8]}>
                            <meshBasicMaterial color="orange" wireframe />
                        </Sphere>
                    )}
                </group>
            ))}
        </group>
    )
}
