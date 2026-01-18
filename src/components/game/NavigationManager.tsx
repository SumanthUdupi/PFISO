import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import navigationSystem from '../../systems/NavigationSystem'

interface NavigationManagerProps {
    debug?: boolean
}

export const NavigationManager: React.FC<NavigationManagerProps> = ({ debug = false }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const [debugPath, setDebugPath] = useState<THREE.Vector3[] | null>(null)
    const { scene } = useThree()

    // Initialize NavMesh
    useEffect(() => {
        if (meshRef.current) {
            // Ensure the matrix is updated world-space
            meshRef.current.updateMatrixWorld()
            navigationSystem.init(meshRef.current)
        }
    }, [])

    // Debug: Test pathfinding on click (TEMPORARY: Remove or disable for prod)
    useEffect(() => {
        const onDebugClick = (e: MouseEvent) => {
            if (!e.ctrlKey) return // Only debug if Ctrl is held

            // Simple raycast from camera not implemented here fully without Three hooks/events, 
            // but we can assume player position to random point if needed.
            // For now, let's just log readiness.
            console.log("NavSystem Ready:", navigationSystem.isReady)
        }
        window.addEventListener('click', onDebugClick)
        return () => window.removeEventListener('click', onDebugClick)
    }, [])

    // Debug Path Visualizer
    // Expose a helper to draw path
    useEffect(() => {
        // We could listen to an event 'DEBUG_PATH_FOUND'
        // For now, let's just export a global function for console testing
        (window as any).testPath = (x: number, z: number) => {
            const start = new THREE.Vector3(0, 0, 0)
            const end = new THREE.Vector3(x, 0, z)
            const path = navigationSystem.findPath(start, end)
            console.log("Found path:", path)
            if (path) setDebugPath(path)
        }
    }, [])

    return (
        <group>
            {/* The NavMesh Geometry - Hidden but present for logic */}
            {/* Simple Floor 100x100 */}
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} visible={false}>
                <planeGeometry args={[40, 40, 10, 10]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>

            {/* Debug Line */}
            {debugPath && (
                <Line
                    points={debugPath}
                    color="cyan"
                    lineWidth={3}
                    position={[0, 0.1, 0]} // Lift slightly
                />
            )}
        </group>
    )
}
