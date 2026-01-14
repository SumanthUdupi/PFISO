import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Html, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Select } from '@react-three/postprocessing'
import useGameStore, { SkillTier } from '../../store'
import useCursorStore from '../../stores/CursorStore'
import useInteractionStore from '../../stores/interactionStore'
import InteractionParticles from './InteractionParticles'

interface InteractiveObjectProps {
  position: [number, number, number]
  color?: string
  label: string
  onClick: () => void
  playerPosition?: THREE.Vector3
  visibleMesh?: boolean
  isFocused?: boolean // Deprecated, but keeping for compatibility if needed. Store takes precedence.
  castShadow?: boolean
  requiredSkill?: { name: string, tier: SkillTier }
}

const INTERACTION_RADIUS = 2.5

const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  position,
  color = '#7ED321',
  label,
  onClick,
  playerPosition, // Still useful for "InRange" distance check visual fallback
  visibleMesh = true,
  castShadow = true,
  requiredSkill
}) => {
  // Store integration
  const { registerObject, unregisterObject, setHovered, getActiveId } = useInteractionStore()
  const { setCursor } = useCursorStore()
  const { unlockedSkills } = useGameStore()

  // Use label as ID for now (assuming unique)
  const id = label
  const activeId = useInteractionStore(state => state.getActiveId())
  const isStoreActive = activeId === id

  const meshRef = useRef<THREE.Mesh>(null)

  // Stable callback ref to prevent infinite loop updates
  const onClickRef = useRef(onClick)
  useEffect(() => { onClickRef.current = onClick }, [onClick])

  // Register on mount
  useEffect(() => {
    // We pass a dummy RefObject if visibleMesh is false, or real one.
    // Actually we need position.
    const pos = new THREE.Vector3(...position)
    registerObject(id, {
      id,
      position: pos,
      label,
      type: 'custom', // Generic
      onInteract: () => onClickRef.current(),
      ref: { current: null } // We don't necessarily need the ref for logic, just position
    })
    return () => unregisterObject(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, label, position[0], position[1], position[2], registerObject, unregisterObject])

  // Local state for visuals
  const [inRange, setInRange] = useState(false)

  // Check if locked
  const isLocked = useMemo(() => {
    if (!requiredSkill) return false;
    const currentTier = unlockedSkills[requiredSkill.name] || 'Locked';
    const tierValue = { 'Locked': 0, 'Novice': 1, 'Proficient': 2, 'Master': 3 };
    return tierValue[currentTier] < tierValue[requiredSkill.tier];
  }, [requiredSkill, unlockedSkills]);

  const objectPos = useMemo(() => new THREE.Vector3(...position), [position])

  useFrame(() => {
    if (playerPosition) {
      const dist = playerPosition.distanceTo(objectPos)
      const newInRange = dist < INTERACTION_RADIUS
      if (inRange !== newInRange) setInRange(newInRange)
    }
  })

  const isActive = isStoreActive && !isLocked;
  const [triggerBurst, setTriggerBurst] = useState(false);

  const handleInteraction = () => {
    if (isLocked) return;
    setTriggerBurst(true);
    setTimeout(() => setTriggerBurst(false), 500);
    onClick();
  }

  const handlePointerOver = () => {
    setCursor(isLocked ? 'not-allowed' : 'pointer')
    setHovered(id)
  }

  const handlePointerOut = () => {
    setCursor('default')
    setHovered(null)
  }

  return (
    <group position={position}>
      <InteractionParticles active={triggerBurst} color={color} count={15} />
      <group>
        {visibleMesh ? (
          <Float speed={isLocked ? 0 : 2} rotationIntensity={isLocked ? 0 : 0.2} floatIntensity={isLocked ? 0 : 0.2}>
            {/* MECH-014: Wrap in Select for Outline effect */}
            <Select enabled={isActive}>
              <mesh
                ref={meshRef}
                castShadow={castShadow}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleInteraction}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color={isLocked ? '#5d4037' : (isActive ? '#fcf4e8' : color)} // Locked: Dark Brown, Active: Warm Cream
                  emissive={isLocked ? '#2d2424' : (isActive ? color : '#000000')} // Locked: Charcoal
                  emissiveIntensity={isLocked ? 0.2 : 0.5}
                />
              </mesh>
            </Select>

            {/* Permanent Visual Identifier */}
            {!isActive && !isLocked && (
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.02, 1.02, 1.02]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.3}
                  side={THREE.BackSide}
                  toneMapped={false}
                />
              </mesh>
            )}

            {/* Lock Icon Overlay */}
            {isLocked && (
              <Html center pointerEvents="none" position={[0, 0, 0.6]}>
                <div style={{ fontSize: '24px' }}>🔒</div>
              </Html>
            )}
          </Float>
        ) : (
          // Invisible trigger
          <mesh
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleInteraction}
          >
            <boxGeometry args={[1.2, 1.5, 1.2]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        )}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color={isLocked ? '#7f8c8d' : color} transparent opacity={inRange ? 0.8 : 0.3} />
        </mesh>

        {isActive && (
          <Html position={[0, 1.5, 0]} center style={{ pointerEvents: 'none', zIndex: 1000 }}>
             <div style={{
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               animation: 'float 2s ease-in-out infinite'
             }}>
               {/* Minimal Key Prompt */}
               <div style={{
                 background: '#fcf4e8',
                 border: '2px solid #4a3728',
                 borderRadius: '4px',
                 boxShadow: '0 2px 0 #4a3728',
                 width: '24px',
                 height: '24px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontFamily: '"Press Start 2P", cursive',
                 fontSize: '10px',
                 color: '#4a3728',
                 marginBottom: '4px'
               }}>
                 E
               </div>
               <span style={{
                 fontFamily: '"Press Start 2P", cursive',
                 fontSize: '10px',
                 color: '#fcf4e8',
                 textShadow: '1px 1px 0 #4a3728, -1px -1px 0 #4a3728, 1px -1px 0 #4a3728, -1px 1px 0 #4a3728',
               }}>
                 {label}
               </span>
             </div>
             <style>{`
               @keyframes float {
                 0%, 100% { transform: translateY(0); }
                 50% { transform: translateY(-5px); }
               }
             `}</style>
          </Html>
        )}
      </group>
    </group>
  )
}

export default InteractiveObject
