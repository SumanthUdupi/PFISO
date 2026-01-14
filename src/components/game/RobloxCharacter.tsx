import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface RobloxCharacterProps {
  isMoving: boolean
  speed?: number // Added speed prop
  lookTarget?: THREE.Vector3
}

const RobloxCharacter: React.FC<RobloxCharacterProps> = ({ isMoving, speed = 0, lookTarget }) => {
  // --- REFS ---
  const group = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const headGroup = useRef<THREE.Group>(null)
  const torsoGroup = useRef<THREE.Group>(null) // New ref for bobbing

  // --- REUSABLE LOGIC VARS ---
  const lookDir = useRef(new THREE.Vector3())
  const animTime = useRef(0) // Local animation time

  // --- VISUAL CONFIGURATION ---
  const bevel = 0.02
  const segment = 4

  // --- MATERIALS ---
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({ color: '#ffdbac', roughness: 0.3 }),
      suit: new THREE.MeshStandardMaterial({ color: '#4a3728', roughness: 0.9 }), // Dark Coffee Suit
      shirt: new THREE.MeshStandardMaterial({ color: '#fff3e0', roughness: 0.6 }), // Warm Cream Shirt
      tie: new THREE.MeshStandardMaterial({ color: '#e67e22', roughness: 0.4 }), // Burnt Orange Tie
      shoe: new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.2 }), // Dark Leather
      hair: new THREE.MeshStandardMaterial({ color: '#2d2424', roughness: 0.9 }), // Dark Charcoal Hair
      eyes: new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.1, emissive: '#000000' })
    }
  }, [])

  useFrame((state, delta) => {
    // 1. Head Tracking (Simplified)
    if (headGroup.current && group.current) {
      // ... (Keep existing simple smoothing behavior)
      const smoothFactor = 1.0 - Math.exp(-4 * delta)
      headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, 0, smoothFactor)
      headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, 0, smoothFactor)
    }

    // 2. Walk Animation System (MECH-FIX)
    if (!leftLeg.current || !rightLeg.current || !leftArm.current || !rightArm.current || !torsoGroup.current) return

    if (isMoving && speed > 0.1) {
      // Sync animation speed with movement speed
      // Base walk speed roughly 1.5 cycles per second at normal speed
      const walkCycleSpeed = speed * 2.5
      animTime.current += delta * walkCycleSpeed

      const t = animTime.current

      // Limbs - Simple Sine Wave but synced
      const legAmp = 0.8 // Increased amplitude for more confident stride
      const armAmp = 0.6

      leftLeg.current.rotation.x = Math.sin(t) * legAmp
      rightLeg.current.rotation.x = Math.sin(t + Math.PI) * legAmp // Perfect opposite phase

      leftArm.current.rotation.x = Math.sin(t + Math.PI) * armAmp // Arms opposite to legs
      rightArm.current.rotation.x = Math.sin(t) * armAmp

      // Body Bobbing (Vertical)
      // Bobs twice per cycle (once for each step)
      const bobParams = { amp: 0.05, freq: 2 }
      const bobOffset = Math.sin(t * bobParams.freq - Math.PI / 2) * bobParams.amp
      // Only bob the torso/head/arms, legs stay grounded relative (visually)
      torsoGroup.current.position.y = 0.6 + Math.abs(bobOffset)

    } else {
      // Return to Idle
      // Smoothly reset limbs
      const lerpSpeed = 10 * delta
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, lerpSpeed)
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, lerpSpeed)
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, lerpSpeed)
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, lerpSpeed)

      // Reset Bob
      torsoGroup.current.position.y = THREE.MathUtils.lerp(torsoGroup.current.position.y, 0.6, lerpSpeed)
    }
  })

  return (
    <group ref={group}>
      {/* Legs attached to root (hip) so they don't bob UP with the body, but rotate */}
      {/* Adjusted Z positions to prevent butt-clipping */}
      <group ref={leftLeg} position={[-0.11, 0.4, 0]}>
        <group position={[0, -0.2, 0]}>
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
          <group position={[0, -0.22, 0.03]}>
            <RoundedBox args={[0.185, 0.08, 0.24]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
          </group>
        </group>
      </group>

      <group ref={rightLeg} position={[0.11, 0.4, 0]}>
        <group position={[0, -0.2, 0]}>
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
          <group position={[0, -0.22, 0.03]}>
            <RoundedBox args={[0.185, 0.08, 0.24]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
          </group>
        </group>
      </group>

      {/* Torso Group that BOBS */}
      <group ref={torsoGroup} position={[0, 0.6, 0]}>
        {/* Main Body */}
        <group position={[0, 0, 0]}>
          <RoundedBox args={[0.42, 0.42, 0.22]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.suit} />

          {/* Shirt/Tie Details... */}
          <group position={[0, 0, 0.115]}>
            <RoundedBox args={[0.18, 0.41, 0.01]} radius={0.005} castShadow receiveShadow material={materials.shirt} />
            <group position={[0, -0.02, 0.01]}>
              <RoundedBox args={[0.07, 0.32, 0.015]} radius={0.01} castShadow receiveShadow material={materials.tie} />
              <group position={[0, 0.18, 0.005]}>
                <RoundedBox args={[0.08, 0.06, 0.02]} radius={0.02} castShadow material={materials.tie} />
              </group>
            </group>
          </group>
          <group position={[0, 0.22, 0]}>
            <RoundedBox args={[0.2, 0.04, 0.22]} radius={0.01} material={materials.shirt} />
          </group>
        </group>

        {/* Arms attached to Torso */}
        <group ref={leftArm} position={[-0.32, 0.15, 0]}>
          <group position={[0, -0.2, 0]}>
            <RoundedBox args={[0.16, 0.4, 0.16]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
            <group position={[0, -0.21, 0]}>
              <RoundedBox args={[0.14, 0.03, 0.14]} radius={0.01} material={materials.shirt} />
            </group>
            <group position={[0, -0.28, 0]}>
              <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.skin} />
            </group>
          </group>
        </group>

        <group ref={rightArm} position={[0.32, 0.15, 0]}>
          <group position={[0, -0.2, 0]}>
            <RoundedBox args={[0.16, 0.4, 0.16]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
            <group position={[0, -0.21, 0]}>
              <RoundedBox args={[0.14, 0.03, 0.14]} radius={0.01} material={materials.shirt} />
            </group>
            <group position={[0, -0.28, 0]}>
              <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.skin} />
            </group>
          </group>
        </group>

        {/* Head attached to Torso */}
        <group ref={headGroup} position={[0, 0.2, 0]}>
          <group position={[0, 0.05, 0]}>
            <mesh castShadow receiveShadow material={materials.skin}><cylinderGeometry args={[0.08, 0.08, 0.1]} /></mesh>
          </group>
          <group position={[0, 0.22, 0]}>
            <RoundedBox args={[0.24, 0.24, 0.24]} radius={0.06} smoothness={8} castShadow receiveShadow material={materials.skin} />
            <group position={[0, 0.04, 0]}>
              <group position={[0, 0.12, 0]}>
                <RoundedBox args={[0.26, 0.1, 0.26]} radius={0.02} castShadow receiveShadow material={materials.hair} />
              </group>
              <group position={[0, -0.02, -0.04]}>
                <RoundedBox args={[0.26, 0.2, 0.2]} radius={0.02} castShadow receiveShadow material={materials.hair} />
              </group>
            </group>
            <group position={[0, 0, 0.125]}>
              <group position={[-0.05, 0.02, 0]}><RoundedBox args={[0.025, 0.035, 0.01]} radius={0.01} material={materials.eyes} /></group>
              <group position={[0.05, 0.02, 0]}><RoundedBox args={[0.025, 0.035, 0.01]} radius={0.01} material={materials.eyes} /></group>
              <group position={[0, 0.02, 0.01]}>
                <mesh material={materials.shoe} position={[-0.05, 0, 0]}><ringGeometry args={[0.02, 0.035, 32]} /></mesh>
                <mesh material={materials.shoe} position={[0.05, 0, 0]}><ringGeometry args={[0.02, 0.035, 32]} /></mesh>
                <mesh material={materials.shoe} position={[0, 0.005, 0]}><boxGeometry args={[0.04, 0.005, 0.001]} /></mesh>
              </group>
              <group position={[0, -0.05, 0]}><RoundedBox args={[0.06, 0.015, 0.005]} radius={0.005} material={materials.eyes} /></group>
            </group>
          </group>
        </group>

      </group>
    </group>
  )
}
export default RobloxCharacter
