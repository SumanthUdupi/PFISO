import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Html, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore, { SkillTier } from '../../store'
import useCursorStore from '../../stores/CursorStore'
import InteractionParticles from './InteractionParticles'

interface InteractiveObjectProps {
  position: [number, number, number]
  color?: string
  label: string
  onClick: () => void
  playerPosition?: THREE.Vector3
  visibleMesh?: boolean
  isFocused?: boolean
  castShadow?: boolean
  requiredSkill?: { name: string, tier: SkillTier }
}

const INTERACTION_RADIUS = 2.5

const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  position,
  color = '#7ED321',
  label,
  onClick,
  playerPosition,
  visibleMesh = true,
  isFocused = false,
  castShadow = true,
  requiredSkill
}) => {
  const [hovered, setHovered] = useState(false)
  const [inRange, setInRange] = useState(false)
  const [anchorX, setAnchorX] = useState<'center' | 'left' | 'right'>('center')
  const { unlockedSkills } = useGameStore();
  const { setCursor } = useCursorStore()

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

  const isActive = (hovered || isFocused) && !isLocked;
  const [triggerBurst, setTriggerBurst] = useState(false);

  const handleInteraction = () => {
    if (isLocked) return;
    setTriggerBurst(true);
    setTimeout(() => setTriggerBurst(false), 500);
    onClick();
  }

  const handlePointerOver = () => {
    setCursor(isLocked ? 'not-allowed' : 'pointer')
    setHovered(true)
  }

  const handlePointerOut = () => {
    setCursor('default')
    setHovered(false)
  }

  return (
    <group position={position}>
      <InteractionParticles active={triggerBurst} color={color} count={15} />
      <group>
        {visibleMesh ? (
          <Float speed={isLocked ? 0 : 2} rotationIntensity={isLocked ? 0 : 0.2} floatIntensity={isLocked ? 0 : 0.2}>
            <mesh
              castShadow={castShadow}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
              onClick={handleInteraction}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={isLocked ? '#7f8c8d' : (isActive ? '#ecf0f1' : color)}
                emissive={isLocked ? '#2c3e50' : (isActive ? color : '#000000')}
                emissiveIntensity={isLocked ? 0.2 : 0.5}
              />
            </mesh>

            {/* Outline Effect */}
            {isActive && !isLocked && (
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.05, 1.05, 1.05]} />
                <meshBasicMaterial
                  color={isFocused ? "#00ffff" : "white"}
                  side={THREE.BackSide}
                  toneMapped={false}
                />
              </mesh>
            )}

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
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              border: `2px solid ${isLocked ? '#7f8c8d' : color}`,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontWeight: 'bold' }}>{label}</span>
              {isLocked ? (
                <span style={{ fontSize: '8px', color: '#e74c3c', background: '#fadbd8', padding: '2px 6px', borderRadius: '10px' }}>
                  REQUIRES: {requiredSkill?.name} ({requiredSkill?.tier})
                </span>
              ) : (
                <span style={{ fontSize: '8px', color: '#666', background: '#eee', padding: '2px 6px', borderRadius: '10px' }}>
                  {isFocused ? 'PRESS ENTER' : 'CLICK / WALK NEAR'}
                </span>
              )}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

export default InteractiveObject
