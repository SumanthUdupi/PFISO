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
  const wallColor = '#bdc3c7'
  const wallHeight = height
  const wallThickness = 1 // Visual thickness

  // Collider Logic:
  // We want to prevent player from falling off ANY side, not just the visible walls.
  // So we add invisible colliders for South and East.

  return (
    <group>
      {/* North Wall (Back) - Visual + Collider */}
      <RigidBody type="fixed" colliders={false}>
         <CuboidCollider args={[width / 2, wallHeight / 2, wallThickness / 2]} position={[0, wallHeight/2, -depth/2]} />
         <mesh position={[0, wallHeight/2, -depth/2]} receiveShadow>
            <boxGeometry args={[width, wallHeight, wallThickness]} />
            <meshStandardMaterial color={wallColor} />
         </mesh>
      </RigidBody>

      {/* West Wall (Left) - Visual + Collider */}
      <RigidBody type="fixed" colliders={false}>
         <CuboidCollider args={[wallThickness / 2, wallHeight / 2, depth / 2]} position={[-width/2, wallHeight/2, 0]} />
         <mesh position={[-width/2, wallHeight/2, 0]} receiveShadow>
            <boxGeometry args={[wallThickness, wallHeight, depth]} />
            <meshStandardMaterial color={wallColor} />
         </mesh>
      </RigidBody>

      {/* South Wall (Front) - Invisible Collider */}
      <RigidBody type="fixed">
          <CuboidCollider args={[width / 2, wallHeight / 2, wallThickness / 2]} position={[0, wallHeight/2, depth/2]} />
      </RigidBody>

      {/* East Wall (Right) - Invisible Collider */}
      <RigidBody type="fixed">
          <CuboidCollider args={[wallThickness / 2, wallHeight / 2, depth / 2]} position={[width/2, wallHeight/2, 0]} />
      </RigidBody>
    </group>
  )
}

export default Walls
