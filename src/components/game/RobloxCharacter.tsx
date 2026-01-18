import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface RobloxCharacterProps {
  isMoving: boolean
  speed?: number // Added speed prop
  lookTarget?: THREE.Vector3
  onStep?: () => void
  isSitting?: boolean // Added isSitting prop
  shirtColor?: string
  pantsColor?: string
}

const RobloxCharacter: React.FC<RobloxCharacterProps> = (props) => {
  const { isMoving, speed = 0, lookTarget, onStep, isSitting } = props;

  // --- REFS ---
  const group = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const headGroup = useRef<THREE.Group>(null)
  const torsoGroup = useRef<THREE.Group>(null)

  // --- REUSABLE LOGIC VARS ---
  const animTime = useRef(0)
  const currentHeadRot = useRef({ x: 0, y: 0 })

  // --- VISUAL CONFIGURATION ---
  const bevel = 0.02
  const segment = 4

  // --- MATERIALS ---
  const materials = useMemo(() => {
    return {
      skin: new THREE.MeshStandardMaterial({ color: '#ffdbac', roughness: 0.3 }),
      suit: new THREE.MeshStandardMaterial({ color: props.pantsColor || '#2c3e50', roughness: 0.9 }),
      shirt: new THREE.MeshStandardMaterial({ color: props.shirtColor || '#3498db', roughness: 0.6 }),
      tie: new THREE.MeshStandardMaterial({ color: '#e67e22', roughness: 0.4 }),
      shoe: new THREE.MeshStandardMaterial({ color: '#3e2723', roughness: 0.2 }),
      hair: new THREE.MeshStandardMaterial({ color: '#2d2424', roughness: 0.9 }),
      eyes: new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.1, emissive: '#000000' })
    }
  }, [props.shirtColor, props.pantsColor])

  useFrame((state, delta) => {
    // 1. Head Tracking (IK)
    if (headGroup.current && group.current) {
      let targetY = 0
      let targetX = 0

      if (lookTarget) {
        // Convert world target to local space relative to character
        const localTarget = group.current.worldToLocal(lookTarget.clone())

        // Calculate look angles
        // atan2(x, z) gives yaw. Note Z is forward in some contexts, but usually -Z.
        // In our character, +Z is forward face? No, usually +Z is front or -Z. 
        // Let's assume standard ThreeJS: +Z is towards camera (back), -Z is forward.
        // Our character likely faces +Z or -Z. Let's test.
        // Actually, usually characters face +Z in standard T-pose or +Z is "Forward" in Rapier? 
        // We'll try standard `lookAt` logic.

        // Check if target is in front (dot product or simple z check)
        // If z is positive (in front) -> wait, depends on model orientation.

        const distance = localTarget.length()
        if (distance > 0.5 && distance < 10) {
          // Simple approach: look at the target
          // Yaw
          targetY = Math.atan2(localTarget.x, localTarget.z)
          // Clamp yaw (don't break neck) - 60 degrees
          targetY = Math.max(-1.5, Math.min(1.5, targetY))

          // Pitch (Height)
          targetX = -Math.atan2(localTarget.y, Math.sqrt(localTarget.x ** 2 + localTarget.z ** 2))
          targetX = Math.max(-0.8, Math.min(0.8, targetX))
        }
      } else if (isMoving) {
        // Look slightly into turn? 
        // Or just reset
        targetY = 0
        // Look slightly down when running?
        targetX = speed > 5 ? 0.1 : 0
      }

      const smoothFactor = 1.0 - Math.exp(-8 * delta)
      currentHeadRot.current.y = THREE.MathUtils.lerp(currentHeadRot.current.y, targetY, smoothFactor)
      currentHeadRot.current.x = THREE.MathUtils.lerp(currentHeadRot.current.x, targetX, smoothFactor)

      headGroup.current.rotation.y = currentHeadRot.current.y
      headGroup.current.rotation.x = currentHeadRot.current.x
    }

    // 2. Walk Animation System
    if (!leftLeg.current || !rightLeg.current || !leftArm.current || !rightArm.current || !torsoGroup.current) return

    if (props.isSitting) {
      // Sitting Pose
      const sitLerp = 10 * delta
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, -Math.PI / 2, sitLerp)
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, -Math.PI / 2, sitLerp)
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -0.2, sitLerp)
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -0.2, sitLerp)
      torsoGroup.current.position.y = THREE.MathUtils.lerp(torsoGroup.current.position.y, 0.5, sitLerp)
      torsoGroup.current.rotation.x = THREE.MathUtils.lerp(torsoGroup.current.rotation.x, 0, sitLerp)
      return
    }

    // Tilt Torso based on speed (Forward lean)
    const targetLean = isMoving ? Math.min(speed * 0.05, 0.2) : 0
    torsoGroup.current.rotation.x = THREE.MathUtils.lerp(torsoGroup.current.rotation.x, targetLean, delta * 5)


    if (isMoving && speed > 0.1) {
      // Sync animation speed with movement speed
      const walkCycleSpeed = speed * 2.5

      const prevAnimTime = animTime.current
      animTime.current += delta * walkCycleSpeed
      const t = animTime.current

      const cycle = 2 * Math.PI
      const prevPhase = prevAnimTime % cycle
      const currPhase = t % cycle

      if (prevPhase < Math.PI / 2 && currPhase >= Math.PI / 2) {
        if (onStep) onStep()
      }
      if (prevPhase < 3 * Math.PI / 2 && currPhase >= 3 * Math.PI / 2) {
        if (onStep) onStep()
      }

      // Sine Wave Limbs
      const legAmp = 0.8
      const armAmp = 0.6

      leftLeg.current.rotation.x = Math.sin(t) * legAmp
      rightLeg.current.rotation.x = Math.sin(t + Math.PI) * legAmp

      leftArm.current.rotation.x = Math.sin(t + Math.PI) * armAmp
      rightArm.current.rotation.x = Math.sin(t) * armAmp

      const bobParams = { amp: 0.05, freq: 2 }
      const bobOffset = Math.sin(t * bobParams.freq - Math.PI / 2) * bobParams.amp
      torsoGroup.current.position.y = 0.6 + Math.abs(bobOffset)

    } else {
      // Idle
      const lerpSpeed = 10 * delta
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, lerpSpeed)
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, lerpSpeed)
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, lerpSpeed)
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, lerpSpeed)
      torsoGroup.current.position.y = THREE.MathUtils.lerp(torsoGroup.current.position.y, 0.6, lerpSpeed)
    }
  })

  return (
    <group ref={group}>
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

      <group ref={torsoGroup} position={[0, 0.6, 0]}>
        <group position={[0, 0, 0]}>
          <RoundedBox args={[0.42, 0.42, 0.22]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.suit} />

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
