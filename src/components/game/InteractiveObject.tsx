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
  const [anchorX, setAnchorX] = useState<'center' | 'left' | 'right'>('center')

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

  useEffect(() => {
    if (position[0] > 2) setAnchorX('right')
    else if (position[0] < -2) setAnchorX('left')
    else setAnchorX('center')
  }, [position])

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

        {(isActive || inRange) && (
          <Html position={[0, 1.5, 0]} center={anchorX === 'center'} style={{
            transform: anchorX === 'left' ? 'translateX(0%)' : anchorX === 'right' ? 'translateX(-100%)' : 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 1000
          }}>
            <div style={{
              color: '#333',
              background: '#fff',
              padding: '12px 18px',
              borderRadius: '8px',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              border: `3px solid #333`,
              boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transform: 'translateY(-10px)'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{label}</span>
              {isLocked ? (
                <span style={{ fontSize: '8px', color: '#c0392b', background: '#fadbd8', padding: '4px 8px', borderRadius: '4px', border: '1px solid #c0392b' }}>
                  REQ: {requiredSkill?.name} ({requiredSkill?.tier})
                </span>
              ) : (
                <span style={{ fontSize: '8px', color: '#666', marginTop: '2px' }}>
                  {isActive ? '[ENTER] to INTERACT' : 'WALK CLOSER'}
                </span>
              )}
              {/* Little tail for speech bubble */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #333'
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #fff'
              }} />
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

export default InteractiveObject
