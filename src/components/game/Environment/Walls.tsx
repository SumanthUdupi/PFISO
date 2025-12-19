import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface WallsProps {
  width: number
  depth: number
  height: number
  playerPosition: THREE.Vector3
}

const WallSegment = ({
  position,
  rotation,
  size,
  color,
  opacity = 1
}: {
  position: [number, number, number],
  rotation: [number, number, number],
  size: [number, number, number],
  color: string,
  opacity?: number
}) => {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  )
}

const Walls: React.FC<WallsProps> = ({ width, depth, height, playerPosition }) => {
  const segmentWidth = 1.0 // 1 unit per segment
  const wallColor = '#bdc3c7'
  const wallHeight = height

  // North Wall (Back) - Solid
  // Located at Z = -depth/2
  const northWall = (
    <mesh position={[0, wallHeight/2, -depth/2]} receiveShadow>
      <boxGeometry args={[width, wallHeight, 1]} />
      <meshStandardMaterial color={wallColor} />
    </mesh>
  )

  // West Wall (Left) - Solid
  // Located at X = -width/2
  const westWall = (
    <mesh position={[-width/2, wallHeight/2, 0]} receiveShadow>
      <boxGeometry args={[1, wallHeight, depth]} />
      <meshStandardMaterial color={wallColor} />
    </mesh>
  )

  // South Wall (Front) - Segmented for occlusion
  // Located at Z = depth/2
  // Extends along X from -width/2 to width/2
  const southSegments = useMemo(() => {
    const count = Math.ceil(width / segmentWidth)
    return Array.from({ length: count }).map((_, i) => {
      // Center of segment
      const x = -width/2 + (i * segmentWidth) + (segmentWidth/2)
      return { x, key: `s-${i}` }
    })
  }, [width])

  // East Wall (Right) - Segmented for occlusion
  // Located at X = width/2
  // Extends along Z from -depth/2 to depth/2
  const eastSegments = useMemo(() => {
    const count = Math.ceil(depth / segmentWidth)
    return Array.from({ length: count }).map((_, i) => {
      const z = -depth/2 + (i * segmentWidth) + (segmentWidth/2)
      return { z, key: `e-${i}` }
    })
  }, [depth])

  // Calculate opacity based on player position
  // We can do this in render loop or just reactively.
  // Since playerPosition is a ref passed down (or changes frequently),
  // strict React state might be slow if we re-render full geometry.
  // But for <50 segments it's probably fine.
  // However, playerPosition in Lobby is a ref.
  // Let's use a ref for the segments and update materials in useFrame for best performance.

  const southRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const eastRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])

  useFrame(() => {
    const p = playerPosition

    // South Wall Logic: Z = depth/2
    // Occlusion point on wall: X = Px + (WallZ - Pz)
    const wallZ = depth/2
    // If player is behind the wall (Pz < wallZ)
    if (p.z < wallZ) {
        const occlusionX = p.x + (wallZ - p.z)

        southSegments.forEach((seg, i) => {
            const mat = southRefs.current[i]
            if (mat) {
                // Check if segment is close to occlusionX
                const dist = Math.abs(seg.x - occlusionX)
                // Fade out if close. Range +/- 1.5 units
                if (dist < 1.5) {
                    mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.2, 0.1)
                    mat.transparent = true
                } else {
                    mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.1)
                    mat.transparent = mat.opacity < 0.99
                }
            }
        })
    }

    // East Wall Logic: X = width/2
    // Occlusion point on wall: Z = Pz + (WallX - Px)
    const wallX = width/2
    if (p.x < wallX) {
        const occlusionZ = p.z + (wallX - p.x)

        eastSegments.forEach((seg, i) => {
            const mat = eastRefs.current[i]
            if (mat) {
                const dist = Math.abs(seg.z - occlusionZ)
                if (dist < 1.5) {
                    mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.2, 0.1)
                    mat.transparent = true
                } else {
                    mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.1)
                    mat.transparent = mat.opacity < 0.99
                }
            }
        })
    }
  })

  return (
    <group>
      {northWall}
      {westWall}

      {/* South Wall Segments */}
      <group position={[0, wallHeight/2, depth/2]}>
        {southSegments.map((seg, i) => (
            <mesh
                key={seg.key}
                position={[seg.x, 0, 0]}
                receiveShadow
                castShadow
            >
                <boxGeometry args={[segmentWidth, wallHeight, 1]} />
                <meshStandardMaterial
                    ref={el => southRefs.current[i] = el}
                    color={wallColor}
                />
            </mesh>
        ))}
      </group>

      {/* East Wall Segments */}
      <group position={[width/2, wallHeight/2, 0]}>
        {eastSegments.map((seg, i) => (
             <mesh
                key={seg.key}
                position={[0, 0, seg.z]}
                receiveShadow
                castShadow
            >
                <boxGeometry args={[1, wallHeight, segmentWidth]} />
                <meshStandardMaterial
                    ref={el => eastRefs.current[i] = el}
                    color={wallColor}
                />
            </mesh>
        ))}
      </group>
    </group>
  )
}

export default Walls
