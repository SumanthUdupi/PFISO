import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface RobloxCharacterProps {
  isMoving: boolean
  lookTarget?: THREE.Vector3
}

const RobloxCharacter: React.FC<RobloxCharacterProps> = ({ isMoving, lookTarget }) => {
  // --- REFS (Logic preserved) ---
  const group = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const headGroup = useRef<THREE.Group>(null)

  // --- REUSABLE LOGIC VARS ---
  const targetVec = useRef(new THREE.Vector3())
  const planeNormal = useRef(new THREE.Vector3())
  const planePos = useRef(new THREE.Vector3())
  const dummyPlane = useRef(new THREE.Plane())
  const lookDir = useRef(new THREE.Vector3())
  const worldHeadPos = useRef(new THREE.Vector3())
  const camDir = useRef(new THREE.Vector3())

  // --- VISUAL CONFIGURATION ---
  const bevel = 0.02 // Softens all edges
  const segment = 4 // Quality of bevels

  // --- MATERIALS ---
  // Using MeshPhysicalMaterial for better light interaction/shadows
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: '#ffdbac',
        roughness: 0.3, // Slightly shiny like vinyl/skin
        metalness: 0.0
      }),
      suit: new THREE.MeshStandardMaterial({
        color: '#2c3e50',
        roughness: 0.8, // Matte fabric look
        metalness: 0.1
      }),
      shirt: new THREE.MeshStandardMaterial({
        color: '#f0f0f0',
        roughness: 0.6
      }),
      tie: new THREE.MeshStandardMaterial({
        color: '#e74c3c',
        roughness: 0.4
      }),
      shoe: new THREE.MeshStandardMaterial({
        color: '#111111',
        roughness: 0.1, // Shiny leather
        metalness: 0.1
      }),
      hair: new THREE.MeshStandardMaterial({
        color: '#3d2314',
        roughness: 0.9
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: '#000000',
        roughness: 0.1,
        emissive: '#000000'
      })
    }
  }, [])

  // --- LOGIC LOOP (Preserved Exactly) ---
  useFrame((state, delta) => {
    // 1. Head Tracking
    if (headGroup.current && group.current) {
      let targetPoint: THREE.Vector3 | null = null;

      if (lookTarget) {
        targetPoint = lookTarget;
      } else {
        // MECH-FIX: Removed creepy mouse tracking. 
        // Character now looks forward by default or slight idle sway?
        // For now, null means look forward.
        targetPoint = null;

        // Optional: Idle "looking around" could be added here if needed, 
        // but for now "smooth and functional" means stable.
      }

      if (targetPoint) {
        const localTarget = targetPoint.clone()
        group.current.worldToLocal(localTarget)
        lookDir.current.subVectors(localTarget, new THREE.Vector3(0, 0.8, 0)).normalize()
        let targetYaw = Math.atan2(lookDir.current.x, lookDir.current.z)
        let targetPitch = -Math.asin(lookDir.current.y)

        // Limits
        const limitYaw = THREE.MathUtils.degToRad(80)
        targetYaw = THREE.MathUtils.clamp(targetYaw, -limitYaw, limitYaw)
        const limitPitch = THREE.MathUtils.degToRad(60)
        targetPitch = THREE.MathUtils.clamp(targetPitch, -limitPitch, limitPitch)

        // Smoothing
        const smoothFactor = 1.0 - Math.exp(-6 * delta) // Slower for smoother feel
        headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, targetYaw, smoothFactor)
        headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, targetPitch, smoothFactor)
        headGroup.current.rotation.z = THREE.MathUtils.lerp(headGroup.current.rotation.z, -targetYaw * 0.1, smoothFactor)
      } else {
        // Return to center
        const smoothFactor = 1.0 - Math.exp(-4 * delta)
        headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, 0, smoothFactor)
        headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, 0, smoothFactor)
        headGroup.current.rotation.z = THREE.MathUtils.lerp(headGroup.current.rotation.z, 0, smoothFactor)
      }
    }

    // 2. Walk Animation
    if (!leftLeg.current || !rightLeg.current || !leftArm.current || !rightArm.current) return
    const t = state.clock.getElapsedTime()
    const speed = 10

    if (isMoving) {
      const legAmp = 0.6
      const armAmp = 0.6
      leftLeg.current.rotation.x = Math.sin(t * speed) * legAmp
      rightLeg.current.rotation.x = Math.cos(t * speed) * legAmp
      leftArm.current.rotation.x = -Math.sin(t * speed) * armAmp
      rightArm.current.rotation.x = -Math.cos(t * speed) * armAmp
    } else {
      const lerpSpeed = 0.1
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, lerpSpeed)
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, lerpSpeed)
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, lerpSpeed)
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, lerpSpeed)
    }
  })

  // --- RENDER ---
  return (
    <group ref={group}>

      {/* === LEGS === */}
      {/* Left Leg */}
      <group ref={leftLeg} position={[-0.11, 0.4, 0]}>
        <group position={[0, -0.2, 0]}>
          {/* Pant Leg */}
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
          {/* Shoe */}
          <group position={[0, -0.22, 0.03]}>
            <RoundedBox args={[0.185, 0.08, 0.24]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
          </group>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightLeg} position={[0.11, 0.4, 0]}>
        <group position={[0, -0.2, 0]}>
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
          <group position={[0, -0.22, 0.03]}>
            <RoundedBox args={[0.185, 0.08, 0.24]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
          </group>
        </group>
      </group>

      {/* === TORSO === */}
      <group position={[0, 0.6, 0]}>
        {/* Main Body */}
        <RoundedBox args={[0.42, 0.42, 0.22]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.suit} />

        {/* Shirt Front Layer */}
        <group position={[0, 0, 0.115]}>
          {/* White Shirt Area */}
          <RoundedBox args={[0.18, 0.41, 0.01]} radius={0.005} castShadow receiveShadow material={materials.shirt} />
          {/* Tie */}
          <group position={[0, -0.02, 0.01]}>
            <RoundedBox args={[0.07, 0.32, 0.015]} radius={0.01} castShadow receiveShadow material={materials.tie} />
            {/* Knot */}
            <group position={[0, 0.18, 0.005]}>
              <RoundedBox args={[0.08, 0.06, 0.02]} radius={0.02} castShadow material={materials.tie} />
            </group>
          </group>
        </group>

        {/* Collar Details */}
        <group position={[0, 0.22, 0]}>
          <RoundedBox args={[0.2, 0.04, 0.22]} radius={0.01} material={materials.shirt} />
        </group>
      </group>

      {/* === ARMS === */}
      {/* Left Arm */}
      <group ref={leftArm} position={[-0.32, 0.75, 0]}>
        <group position={[0, -0.2, 0]}>
          {/* Sleeve */}
          <RoundedBox args={[0.16, 0.4, 0.16]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />

          {/* White Cuff */}
          <group position={[0, -0.21, 0]}>
            <RoundedBox args={[0.14, 0.03, 0.14]} radius={0.01} material={materials.shirt} />
          </group>

          {/* Hand */}
          <group position={[0, -0.28, 0]}>
            <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.skin} />
          </group>
        </group>
      </group>

      {/* Right Arm */}
      <group ref={rightArm} position={[0.32, 0.75, 0]}>
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

      {/* === HEAD === */}
      <group ref={headGroup} position={[0, 0.8, 0]}>
        {/* Neck */}
        <group position={[0, 0.05, 0]}>
          <mesh castShadow receiveShadow material={materials.skin}>
            <cylinderGeometry args={[0.08, 0.08, 0.1]} />
          </mesh>
        </group>

        {/* Head Shape */}
        <group position={[0, 0.22, 0]}>
          <RoundedBox args={[0.24, 0.24, 0.24]} radius={0.06} smoothness={8} castShadow receiveShadow material={materials.skin} />

          {/* Hair "Helmet" */}
          <group position={[0, 0.04, 0]}>
            {/* Top */}
            <group position={[0, 0.12, 0]}>
              <RoundedBox args={[0.26, 0.1, 0.26]} radius={0.02} castShadow receiveShadow material={materials.hair} />
            </group>
            {/* Back/Sides */}
            <group position={[0, -0.02, -0.04]}>
              <RoundedBox args={[0.26, 0.2, 0.2]} radius={0.02} castShadow receiveShadow material={materials.hair} />
            </group>
          </group>

          {/* Face Features */}
          <group position={[0, 0, 0.125]}>
            {/* Eyes - Shiny 3D beads */}
            <group position={[-0.05, 0.02, 0]}>
              <RoundedBox args={[0.025, 0.035, 0.01]} radius={0.01} material={materials.eyes} />
            </group>
            <group position={[0.05, 0.02, 0]}>
              <RoundedBox args={[0.025, 0.035, 0.01]} radius={0.01} material={materials.eyes} />
            </group>

            {/* Glasses (Wireframe style) */}
            <group position={[0, 0.02, 0.01]}>
              {/* Rims */}
              <mesh material={materials.shoe} position={[-0.05, 0, 0]}>
                <ringGeometry args={[0.02, 0.035, 32]} />
              </mesh>
              <mesh material={materials.shoe} position={[0.05, 0, 0]}>
                <ringGeometry args={[0.02, 0.035, 32]} />
              </mesh>
              {/* Bridge */}
              <mesh material={materials.shoe} position={[0, 0.005, 0]}>
                <boxGeometry args={[0.04, 0.005, 0.001]} />
              </mesh>
            </group>

            {/* Mouth - Slight Smile */}
            <group position={[0, -0.05, 0]}>
              <RoundedBox args={[0.06, 0.015, 0.005]} radius={0.005} material={materials.eyes} />
            </group>
          </group>
        </group>
      </group>

    </group>
  )
}

export default RobloxCharacter
