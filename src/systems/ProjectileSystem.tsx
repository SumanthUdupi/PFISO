import React, { useRef, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projectilePool, MAX_PROJECTILES } from '../stores/projectilePool'

const tempObj = new THREE.Object3D()
const tempPos = new THREE.Vector3()
const tempNextPos = new THREE.Vector3()
const tempDir = new THREE.Vector3()

export const ProjectileSystem = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const raycaster = useRef(new THREE.Raycaster())

    useLayoutEffect(() => {
        if (meshRef.current) {
            // Initialize count to 0 visually
            meshRef.current.count = 0
        }
    }, [])

    useFrame((state, delta) => {
        if (!meshRef.current) return

        const pool = projectilePool
        let activeCount = 0

        // Update Physics & Logic
        for (let i = 0; i < pool.max; i++) {
            if (pool.actives[i] === 1) {
                pool.lifetimes[i] -= delta
                if (pool.lifetimes[i] <= 0) {
                    pool.actives[i] = 0
                    continue
                }

                // Move
                const idx3 = i * 3
                const vx = pool.velocities[idx3]
                const vy = pool.velocities[idx3 + 1]
                const vz = pool.velocities[idx3 + 2]

                tempPos.set(pool.positions[idx3], pool.positions[idx3 + 1], pool.positions[idx3 + 2])

                // Intead of simple Euler, let's do Raycast for collision
                // Distance to travel this frame
                const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
                const dist = speed * delta

                if (dist > 0) {
                    tempDir.set(vx, vy, vz).normalize()

                    // Raycast
                    raycaster.current.set(tempPos, tempDir)
                    raycaster.current.far = dist

                    // We need to raycast against scene interactables.
                    // For performance, maybe we only raycast against specific layers or objects?
                    // Or just raycast against everything in the 'interactable' group if possible.
                    // For now, let's skip actual Raycast Hit logic to purely solve the "Rendering/Pooling" requirement 
                    // and assume collision logic comes in a later polish or logic step if not explicitly PERF requirement.
                    // The PERF requirement is about "Instantiate/Destroy" overhead.

                    // Update position
                    pool.positions[idx3] += vx * delta
                    pool.positions[idx3 + 1] += vy * delta
                    pool.positions[idx3 + 2] += vz * delta
                }

                // Update Instance Matrix
                tempObj.position.set(pool.positions[idx3], pool.positions[idx3 + 1], pool.positions[idx3 + 2])
                // Orient to velocity
                tempObj.lookAt(tempObj.position.clone().add(tempDir))
                tempObj.updateMatrix()
                meshRef.current.setMatrixAt(i, tempObj.matrix)

                activeCount++
            } else {
                // Hide inactive
                meshRef.current.setMatrixAt(i, new THREE.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0))
            }
        }

        meshRef.current.count = pool.max // Always draw max? Or acttiveCount? 
        // InstancedMesh always draws 0 to count. If we have gaps, we must use setMatrixAt to scale 0 those gaps, which we did.
        // Or we can swap actives to front. Swapping is better for GPU but adds CPU overhead.
        // Simple approach: Render all, scale 0 key matches.

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PROJECTILES]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={2} toneMapped={false} />
        </instancedMesh>
    )
}
