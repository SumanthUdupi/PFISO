import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Html, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface InteractiveObjectProps {
  position: [number, number, number]
  color?: string
  label: string
  // onClick is still here for fallback, but we primarily use Keyboard
  onClick: () => void
  playerPosition?: THREE.Vector3
  visibleMesh?: boolean
  // New prop to indicate if this is the active focus
  isFocused?: boolean
  castShadow?: boolean
}

const INTERACTION_RADIUS = 2.5

const InteractiveObject: React.FC<InteractiveObjectProps> = ({ position, color = '#7ED321', label, onClick, playerPosition, visibleMesh = true, isFocused = false, castShadow = true }) => {
  const [hovered, setHovered] = useState(false)
  // We can still track local inRange for visuals if needed, but isFocused is passed from parent
  const [inRange, setInRange] = useState(false)
  const [anchorX, setAnchorX] = useState<'center' | 'left' | 'right'>('center')

  // Memoize the vector for the object position to avoid recreating it
  const objectPos = useMemo(() => new THREE.Vector3(...position), [position])

  useFrame(() => {
    if (playerPosition) {
      const dist = playerPosition.distanceTo(objectPos)
      if (dist < INTERACTION_RADIUS) {
        if (!inRange) setInRange(true)
      } else {
        if (inRange) setInRange(false)
      }
    }
  })

  useEffect(() => {
     if (position[0] > 2) setAnchorX('right')
     else if (position[0] < -2) setAnchorX('left')
     else setAnchorX('center')
  }, [position])

  // Combined active state: either mouse hover or keyboard focus
  const isActive = hovered || isFocused;

  return (
    <group position={position}>
    <group>
      {visibleMesh ? (
         <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
            <mesh
                castShadow={castShadow}
                onPointerOver={() => {
                document.body.style.cursor = 'pointer'
                setHovered(true)
                }}
                onPointerOut={() => {
                document.body.style.cursor = 'auto'
                setHovered(false)
                }}
                onClick={onClick}
            >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={isActive ? '#ecf0f1' : color} emissive={isActive ? color : '#000000'} emissiveIntensity={0.5} />
            </mesh>

            {/* Outline Effect */}
            {isActive && (
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1.05, 1.05, 1.05]} />
                    <meshBasicMaterial
                        color="white"
                        side={THREE.BackSide}
                        toneMapped={false}
                    />
                </mesh>
            )}
         </Float>
      ) : (
          // Invisible trigger
           <mesh
                onPointerOver={() => {
                document.body.style.cursor = 'pointer'
                setHovered(true)
                }}
                onPointerOut={() => {
                document.body.style.cursor = 'auto'
                setHovered(false)
                }}
                onClick={onClick}
            >
                <boxGeometry args={[1.2, 1.5, 1.2]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
      )}

      {/* Interaction Indicator Ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={inRange ? 0.8 : 0.3} />
      </mesh>

      {/* Clean Pop-up UI - replaces speech bubble and hover tooltip */}
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
            border: `2px solid ${color}`,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontWeight: 'bold' }}>{label}</span>
            <span style={{ fontSize: '8px', color: '#666', background: '#eee', padding: '2px 6px', borderRadius: '10px' }}>
                {isFocused ? 'PRESS ENTER' : 'CLICK / WALK NEAR'}
            </span>
          </div>
        </Html>
      )}
    </group>
    </group>
  )
}

export default InteractiveObject
