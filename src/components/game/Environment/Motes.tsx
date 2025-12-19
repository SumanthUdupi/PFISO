import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MotesProps {
  count?: number
  area?: [number, number, number]
}

const Motes: React.FC<MotesProps> = ({ count = 100, area = [20, 10, 20] }) => {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area[0]
      positions[i * 3 + 1] = Math.random() * area[1]
      positions[i * 3 + 2] = (Math.random() - 0.5) * area[2]

      speeds[i] = Math.random() * 0.2 + 0.1
    }

    return [positions, speeds]
  }, [count, area])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
        // Move slightly in some direction (e.g. up or swirl)
        // Here we just drift them slowly

        // Update Y (drift up/down)
        positions[i * 3 + 1] += speeds[i] * delta * 0.5

        // Reset if out of bounds
        if (positions[i * 3 + 1] > area[1]) {
            positions[i * 3 + 1] = 0
        }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="white"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default Motes
