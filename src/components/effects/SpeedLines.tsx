import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gameSystemInstance from '../../systems/GameSystem'

const COUNT = 100
const SPEED_THRESHOLD = 5.0

export const SpeedLines = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const particles = useMemo(() => {
        return new Array(COUNT).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 30, // Wide spread X
            y: (Math.random() - 0.5) * 20, // Wide spread Y
            z: -(Math.random() * 40 + 5), // Start far in front
            speed: 50 + Math.random() * 50
        }))
    }, [])

    useFrame((state, delta) => {
        if (!meshRef.current) return

        const pVel = gameSystemInstance.playerVelocity
        const speed = Math.sqrt(pVel.x * pVel.x + pVel.y * pVel.y + pVel.z * pVel.z)

        // Opacity/Visibility
        if (speed < SPEED_THRESHOLD) {
            meshRef.current.visible = false
            return
        }
        meshRef.current.visible = true

        // Update loop
        const cam = state.camera

        // Match camera position/rotation
        meshRef.current.position.copy(cam.position)
        meshRef.current.quaternion.copy(cam.quaternion)

        particles.forEach((p: { x: number; y: number; z: number; speed: number; }, i: number) => {
            // Move particle towards camera (Z increases)
            p.z += p.speed * delta

            if (p.z > 2) {
                p.z = -(40 + Math.random() * 20)
                p.x = (Math.random() - 0.5) * 30
                p.y = (Math.random() - 0.5) * 20
            }

            dummy.position.set(p.x, p.y, p.z)
            // Scale length based on speed
            dummy.scale.z = 2.0 + (speed / 10)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <boxGeometry args={[0.05, 0.05, 1]} /> {/* Thin lines */}
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    )
}
