import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SparkleBurstProps {
    position: THREE.Vector3
    count?: number
    color?: string
    onComplete?: () => void
}

export const SparkleBurst: React.FC<SparkleBurstProps> = ({ position, count = 20, color = '#FFD700', onComplete }) => {
    const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3, scale: number }[]>([])
    const group = useRef<THREE.Group>(null)

    // Create reusable geometry/material
    const geometry = useMemo(() => new THREE.PlaneGeometry(0.1, 0.1), [])
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, side: THREE.DoubleSide }), [color])

    const initialized = useRef(false)

    useEffect(() => {
        if (!group.current || initialized.current) return
        initialized.current = true

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(geometry, material.clone())

            // Random start position within a small sphere
            mesh.position.copy(position)
            mesh.position.x += (Math.random() - 0.5) * 0.2
            mesh.position.y += (Math.random() - 0.5) * 0.2
            mesh.position.z += (Math.random() - 0.5) * 0.2

            group.current.add(mesh)

            // Explosion velocity
            const angle = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const speed = 1 + Math.random() * 2 // 1 to 3 units/sec

            const vel = new THREE.Vector3(
                Math.sin(phi) * Math.cos(angle),
                Math.cos(phi),
                Math.sin(phi) * Math.sin(angle)
            ).multiplyScalar(speed)

            particles.current.push({
                mesh,
                life: 1.0 + Math.random() * 0.5,
                velocity: vel,
                scale: 0.5 + Math.random() * 0.5
            })
        }
    }, [position, count, geometry, material])

    useFrame((state, delta) => {
        if (!group.current) return

        // Update particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i]
            p.life -= delta * 1.5 // Fade speed

            // Move
            p.mesh.position.addScaledVector(p.velocity, delta)

            // Drag
            p.velocity.multiplyScalar(0.95)

            // Billboard
            p.mesh.lookAt(state.camera.position)

            // Visuals
            const cleanLife = Math.max(0, p.life)
            p.mesh.scale.setScalar(p.scale * cleanLife)
            // @ts-ignore
            p.mesh.material.opacity = cleanLife

            if (p.life <= 0) {
                group.current.remove(p.mesh)
                p.mesh.geometry.dispose()
                // @ts-ignore
                p.mesh.material.dispose()
                particles.current.splice(i, 1)
            }
        }

        if (initialized.current && particles.current.length === 0) {
            if (onComplete) onComplete()
        }
    })

    return <group ref={group} />
}
