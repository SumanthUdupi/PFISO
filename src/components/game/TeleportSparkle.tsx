import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TeleportSparkleProps {
  position: THREE.Vector3
  trigger: boolean
  onComplete?: () => void
}

const TeleportSparkle: React.FC<TeleportSparkleProps> = ({ position, trigger, onComplete }) => {
  const particles = useRef<{ mesh: THREE.Mesh, life: number, velocity: THREE.Vector3 }[]>([])
  const group = useRef<THREE.Group>(null)
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.1, 0.1), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFACD', transparent: true, opacity: 1 }), [])

  const spawned = useRef(false)

  useFrame((state, delta) => {
      if (!group.current) return

      // Spawn
      if (trigger && !spawned.current) {
          spawned.current = true
          for (let i = 0; i < 20; i++) {
              const mesh = new THREE.Mesh(geometry, material.clone())
              mesh.position.copy(position)
              mesh.position.y += 0.5 + (Math.random() - 0.5) * 0.5

              // Billboarding handled by always facing camera? Or just random rotation?
              // Requirement says "facing the camera", so billboarding.
              // But for simple sparkles, random rotation is often fine.
              // Let's make them face camera in update loop.

              group.current.add(mesh)

              const angle = Math.random() * Math.PI * 2
              const speed = Math.random() * 2 + 1
              particles.current.push({
                  mesh,
                  life: 1.0,
                  velocity: new THREE.Vector3(Math.cos(angle) * speed, (Math.random() - 0.5) * 2, Math.sin(angle) * speed)
              })
          }
      }

      // Update
      for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i]
          p.life -= delta * 2
          p.mesh.position.addScaledVector(p.velocity, delta)
          p.mesh.lookAt(state.camera.position) // Billboard

          // @ts-ignore
          p.mesh.material.opacity = p.life

          if (p.life <= 0) {
              group.current.remove(p.mesh)
              p.mesh.geometry.dispose()
              // @ts-ignore
              p.mesh.material.dispose()
              particles.current.splice(i, 1)
          }
      }

      if (trigger && spawned.current && particles.current.length === 0) {
          spawned.current = false
          if (onComplete) onComplete()
      }
  })

  return <group ref={group} />
}

export default TeleportSparkle
