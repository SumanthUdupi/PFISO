import React from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

interface WallsProps {
  width: number
  depth: number
  height: number
  playerPosition: THREE.Vector3 // Kept for API compatibility, though unused currently
}

const Walls: React.FC<WallsProps> = ({ width, depth, height }) => {
  // Use a warmer, lighter color for the walls
  const wallColor = '#fdfbf7' // Warm off-white
  const baseboardColor = '#5d4037' // Dark wood baseboard
  const wallHeight = height
  const wallThickness = 1 // Visual thickness
  const baseboardHeight = 0.4
  const baseboardThickness = 1.1 // Slightly thicker than wall to pop out

  return (
    <group>
      {/* North Wall (Back) - Visual + Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[width / 2, wallHeight / 2, wallThickness / 2]} position={[0, wallHeight / 2, -depth / 2]} />
        <group position={[0, wallHeight / 2, -depth / 2]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[width, wallHeight, wallThickness]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          {/* Baseboard */}
          <mesh position={[0, -wallHeight / 2 + baseboardHeight / 2, 0.05]} receiveShadow>
            <boxGeometry args={[width, baseboardHeight, baseboardThickness]} />
            <meshStandardMaterial color={baseboardColor} />
          </mesh>
        </group>
      </RigidBody>

      {/* West Wall (Left) - Visual + Collider */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[wallThickness / 2, wallHeight / 2, depth / 2]} position={[-width / 2, wallHeight / 2, 0]} />
        <group position={[-width / 2, wallHeight / 2, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[wallThickness, wallHeight, depth]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          {/* Baseboard */}
          <mesh position={[0.05, -wallHeight / 2 + baseboardHeight / 2, 0]} receiveShadow>
            <boxGeometry args={[baseboardThickness, baseboardHeight, depth]} />
            <meshStandardMaterial color={baseboardColor} />
          </mesh>
        </group>
      </RigidBody>

      {/* South Wall (Front) - Invisible Collider */}
      <RigidBody type="fixed">
        <CuboidCollider args={[width / 2, wallHeight / 2, wallThickness / 2]} position={[0, wallHeight / 2, depth / 2]} />
      </RigidBody>

      {/* East Wall (Right) - Invisible Collider */}
      <RigidBody type="fixed">
        <CuboidCollider args={[wallThickness / 2, wallHeight / 2, depth / 2]} position={[width / 2, wallHeight / 2, 0]} />
      </RigidBody>
    </group>
  )
}

export default Walls
