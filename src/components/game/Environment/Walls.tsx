import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface WallsProps {
  width: number
  depth: number
  height: number
  playerPosition: THREE.Vector3
}

const Walls: React.FC<WallsProps> = ({ width, depth, height, playerPosition }) => {
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

  // South and East walls removed for open "dollhouse" look.
  // We only keep North (Back) and West (Left).

  return (
    <group>
      {northWall}
      {westWall}
    </group>
  )
}

export default Walls
