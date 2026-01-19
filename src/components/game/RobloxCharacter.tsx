import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier' // CL-019: Needed for IK
import { RoundedBox, Box } from '@react-three/drei'
import * as THREE from 'three'
import { Cape } from './Cosmetics/Cape' // CL-050

interface RobloxCharacterProps {
  isMoving: boolean
  speed?: number // Added speed prop
  lookTarget?: THREE.Vector3
  onStep?: () => void
  isSitting?: boolean // Added isSitting prop
  shirtColor?: string
  pantsColor?: string
  opacity?: number // CS-016
  opacityRef?: React.MutableRefObject<number> // CS-016 Perf
  hat?: string // CL-043
  boots?: string // CL-048
}

const RobloxCharacter: React.FC<RobloxCharacterProps> = (props) => {
  const { isMoving, speed = 0, lookTarget, onStep, isSitting, hat, boots } = props;

  // --- REFS ---
  const group = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const headGroup = useRef<THREE.Group>(null)
  const torsoGroup = useRef<THREE.Group>(null)
  const hairGroup = useRef<THREE.Group>(null) // CL-043 Ref

  const { world, rapier } = useRapier() // CL-019

  // CL-025: Backpack
  const backpackRef = useRef<THREE.Group>(null)

  // CL-026: Holster
  const holsterRef = useRef<THREE.Group>(null)

  // --- REUSABLE LOGIC VARS ---
  const animTime = useRef(0)
  const fidgetTime = useRef(0) // PM-010
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

  // CS-016: Occlusion Masking (Opacity)
  useFrame(() => {
    let op = 1.0
    if (props.opacityRef) op = props.opacityRef.current
    else if (props.opacity !== undefined) op = props.opacity

    const isTransparent = op < 1.0

    // Cast to explicit type to fix 'unknown' error
    Object.values(materials).forEach((mat: any) => {
      mat.opacity = op
      mat.transparent = isTransparent
      mat.depthWrite = op > 0.5 // Optimization?
    })

    // CL-043: Hat Hair Clip - Hide Hair if Hat is equipped
    // We do this in useFrame to support dynamic hat equipping
    if (hairGroup.current) {
      hairGroup.current.visible = !hat
    }

    // CL-048: Boot Clip - Scale down legs if boots equipped
    // Note: In a real system we'd swap geometry. Here we just scale/hide the "shoe" part of the leg.
    // Actually our leg structure is Leg -> Shoe. 
    // If boots, we can hide the default shoe group or scale the whole lower leg?
    // Let's assume 'boots' means we hide the default shoe box.
    // Logic handled in render below via conditional rendering, but if dynamic:
    // We can't easily reach inside 'leftLeg' without traversing. 
    // Using props directly in render is fine for React updates.
  })

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
        // In this specific character setup, +Z seems to be 'Forward' face direction based on eyes position.

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
      headGroup.current.rotation.y = currentHeadRot.current.y
      headGroup.current.rotation.x = currentHeadRot.current.x
    }

    // CL-019: Simple Feet IK (Stair Clipping)
    // Raycast down from each leg position.
    // If ground is higher than foot, lift foot.
    if (group.current && leftLeg.current && rightLeg.current) {
      const worldPos = group.current.getWorldPosition(new THREE.Vector3())

      const checkLeg = (legObj: THREE.Object3D, offsetX: number) => {
        const origin = worldPos.clone().add(new THREE.Vector3(offsetX, 1.0, 0)) // Start high
        const ray = new rapier.Ray(origin, { x: 0, y: -1, z: 0 })
        const hit = world.castRay(ray, 1.5, true)

        if (hit) {
          const groundY = origin.y - hit.toi
          const currentFootY = worldPos.y // Character root y is roughly foot level?
          // Wait, character relies on RigidBody position. 
          // If RigidBody is on ground, foot Y is usually near 0 relative to RigidBody.
          // If groundY > worldPos.y (step up), we lift the leg.

          const diff = groundY - worldPos.y
          if (diff > 0.05 && diff < 0.5) {
            // Lift leg
            legObj.position.y = THREE.MathUtils.lerp(legObj.position.y, 0.4 + diff, delta * 15)
          } else {
            // Return to default
            legObj.position.y = THREE.MathUtils.lerp(legObj.position.y, 0.4, delta * 10)
          }
        }
      }

      checkLeg(leftLeg.current, -0.14)
      checkLeg(rightLeg.current, 0.14)
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

      // CL-042: Sit Clip - Adjust Hip/Torso Offset
      // Move torso slightly UP (0.5 -> 0.6) and BACK (-0.1) if needed to avoid armrest/seat clip
      torsoGroup.current.position.y = THREE.MathUtils.lerp(torsoGroup.current.position.y, 0.65, sitLerp)
      torsoGroup.current.position.z = THREE.MathUtils.lerp(torsoGroup.current.position.z, -0.1, sitLerp)

      torsoGroup.current.rotation.x = THREE.MathUtils.lerp(torsoGroup.current.rotation.x, 0, sitLerp)

      // CL-025: Hide Backpack when sitting to prevent chair clip
      if (backpackRef.current) backpackRef.current.visible = false
      return
    } else {
      // Reset Z when standing
      torsoGroup.current.position.z = THREE.MathUtils.lerp(torsoGroup.current.position.z, 0, delta * 5)
    }

    // Ensure backpack is visible if not sitting
    if (backpackRef.current) backpackRef.current.visible = true

    // Tilt Torso based on speed (Forward lean)
    const targetLean = isMoving ? Math.min(speed * 0.05, 0.2) : 0
    torsoGroup.current.rotation.x = THREE.MathUtils.lerp(torsoGroup.current.rotation.x, targetLean, delta * 5)

    // PM-031: Head Tracking - Duplicate Logic Removed (Handled in Block 1 with Clamping)
    // CS-048: Fix twist by using the clamped logic above.



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
      // Idle (PM-010)
      const lerpSpeed = 10 * delta
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, 0, lerpSpeed)
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, 0, lerpSpeed)

      // Breathing
      const breath = Math.sin(state.clock.elapsedTime * 2) * 0.02
      torsoGroup.current.scale.y = 1 + breath
      torsoGroup.current.position.y = THREE.MathUtils.lerp(torsoGroup.current.position.y, 0.6 + breath * 0.1, lerpSpeed)

      // Fidgets
      fidgetTime.current += delta
      if (fidgetTime.current > 6) {
        // Trigger Fidget
        // Simple Look Around
        const fidgetRot = Math.sin((fidgetTime.current - 6) * 3) * 0.3
        headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, fidgetRot, delta * 5)

        if (fidgetTime.current > 8) fidgetTime.current = 0 // Reset
      } else {
        // Return to neutral
        leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, lerpSpeed)
        rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, lerpSpeed)
      }
    }
  })

  return (
    <group ref={group}>
      <group ref={leftLeg} position={[-0.14, 0.4, 0]}> {/* CL-010: Widen stance (-0.11 -> -0.14) to clear coat */}
        <group position={[0, -0.2, 0]}>
          {/* CL-048: Boot Clip - Hide leg mesh if boots present? No, keep suit leg, maybe just hide shoe */}
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
          {!boots && (
            <group position={[0, -0.22, 0.03]}>
              <RoundedBox args={[0.185, 0.08, 0.24]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
            </group>
          )}
          {boots && (
            <group position={[0, -0.22, 0.03]}>
              {/* Boot Geo Placeholder */}
              <RoundedBox args={[0.2, 0.12, 0.26]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
            </group>
          )}
        </group>
      </group>

      <group ref={rightLeg} position={[0.14, 0.4, 0]}> {/* CL-010: Widen stance (+0.11 -> +0.14) */}
        <group position={[0, -0.2, 0]}>
          <RoundedBox args={[0.18, 0.4, 0.18]} radius={bevel} smoothness={segment} castShadow receiveShadow material={materials.suit} />
          {!boots && (
            <group position={[0, -0.22, 0.03]}>
              <RoundedBox args={[0.185, 0.08, 0.24]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
            </group>
          )}
          {boots && (
            <group position={[0, -0.22, 0.03]}>
              <RoundedBox args={[0.2, 0.12, 0.26]} radius={0.02} smoothness={segment} castShadow receiveShadow material={materials.shoe} />
            </group>
          )}
        </group>
      </group>

      <group ref={torsoGroup} position={[0, 0.6, 0]}>
        <group position={[0, 0, 0]}>
          <RoundedBox args={[0.42, 0.42, 0.22]} radius={0.04} smoothness={segment} castShadow receiveShadow material={materials.suit} />

          {/* CL-050: Cape/Trenchcoat Clip - Attached to Torso */}
          <Cape position={[0, 0.2, 0.15]} />

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
          <group position={[0, 0.22, 0]}>
            <RoundedBox args={[0.2, 0.04, 0.22]} radius={0.01} material={materials.shirt} />
          </group>

          {/* CL-025: Backpack (Added to Torso) */}
          <group ref={backpackRef} position={[0, 0, -0.15]}>
            <RoundedBox args={[0.3, 0.35, 0.1]} radius={0.02} castShadow receiveShadow material={materials.suit} />
          </group>

          {/* CL-026: Holster (Added to Hip/Torso) */}
          <group ref={holsterRef} position={[0.22, -0.1, 0]}>
            <Box args={[0.05, 0.15, 0.1]} material={materials.suit} />
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

        <group ref={headGroup} position={[0, 0.9, 0]}> {/* CL-009: Raise Head (0.2 -> 0.9) to sit on Shoulders */}
          <group position={[0, 0.05, 0]}>
            <mesh castShadow receiveShadow material={materials.skin}><cylinderGeometry args={[0.08, 0.08, 0.1]} /></mesh>
          </group>
          <group position={[0, 0.22, 0]}>
            <RoundedBox args={[0.24, 0.24, 0.24]} radius={0.06} smoothness={8} castShadow receiveShadow material={materials.skin} />
            <group ref={hairGroup} position={[0, 0.04, 0]}> {/* CL-043: Hair Group */}
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

          {/* Hat Placeholder if props.hat */}
          {hat === 'cap' && (
            <group position={[0, 0.45, 0.1]}>
              {/* Hat Mesh */}
              <Box args={[0.26, 0.1, 0.3]} material={materials.shirt} />
            </group>
          )}
        </group>

      </group>
    </group>
  )
}
export default RobloxCharacter
