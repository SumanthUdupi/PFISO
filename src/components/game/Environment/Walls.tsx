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
  // COZY: Eggshell/Cream Walls - Darkened slightly to reduce glare
  const wallColor = '#f2e6d6' // Darker Cream/Latte
  // COZY: Warm Wood Baseboard
  const baseboardColor = '#d88c5a' // Terracotta - Updated to match palette

  const wallHeight = height
  const wallThickness = 1.0
  const baseboardHeight = 0.5
  const baseboardThickness = 1.1

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

          {/* Window Frame */}
          <group position={[3, 0.5, 0.1]}>
             <mesh receiveShadow castShadow>
                <boxGeometry args={[3, 2, 0.2]} />
                <meshStandardMaterial color="#4a3728" /> {/* Dark Wood Frame */}
             </mesh>
             {/* Glass / Light */}
             <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[2.6, 1.6]} />
                <meshBasicMaterial color="#b0bec5" /> {/* Cool light from outside */}
             </mesh>
              {/* Window Pane Bars */}
             <mesh position={[0, 0, 0.06]}>
                 <boxGeometry args={[0.1, 1.6, 0.05]} />
                 <meshStandardMaterial color="#4a3728" />
             </mesh>
             <mesh position={[0, 0, 0.06]}>
                 <boxGeometry args={[2.6, 0.1, 0.05]} />
                 <meshStandardMaterial color="#4a3728" />
             </mesh>
          </group>

           {/* Poster */}
           <group position={[-3, 0.5, 0.1]}>
              <mesh receiveShadow>
                 <boxGeometry args={[1.5, 2, 0.05]} />
                 <meshStandardMaterial color="#fff" />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                  <planeGeometry args={[1.3, 1.8]} />
                  <meshBasicMaterial color="#e67e22" /> {/* Abstract Art */}
              </mesh>
           </group>

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
