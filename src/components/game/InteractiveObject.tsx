import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Html, Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface InteractiveObjectProps {
  position: [number, number, number]
  color?: string
  label: string
  onClick: () => void
  playerPosition?: THREE.Vector3
  visibleMesh?: boolean
}

const INTERACTION_RADIUS = 2.5

const InteractiveObject: React.FC<InteractiveObjectProps> = ({ position, color = '#7ED321', label, onClick, playerPosition, visibleMesh = true }) => {
  const [hovered, setHovered] = useState(false)
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

  return (
    <group position={position}>
    <group>
      {visibleMesh ? (
         <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
            <mesh
                castShadow
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
                <meshStandardMaterial color={hovered ? '#ecf0f1' : color} emissive={hovered ? color : '#000000'} emissiveIntensity={0.5} />
            </mesh>

            {/* Outline Effect */}
            {hovered && (
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

      {/* Proximity "!" Bubble */}
      {inRange && !hovered && (
        <group position={[0, 1.2, 0]}>
             <Float speed={5} rotationIntensity={0} floatIntensity={0.5}>
                 <Html center transform sprite>
                     <div style={{
                         color: color,
                         background: 'white',
                         width: '30px',
                         height: '30px',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontFamily: '"Press Start 2P", cursive',
                         fontSize: '20px',
                         border: `2px solid ${color}`,
                         boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                     }}>
                         !
                     </div>
                 </Html>
             </Float>
        </group>
      )}

      {hovered && (
        <Html position={[0, 1.5, 0]} center={anchorX === 'center'} style={{
            transform: anchorX === 'left' ? 'translateX(0%)' : anchorX === 'right' ? 'translateX(-100%)' : 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 1000 // Ensure it's on top
        }}>
          <div style={{
            color: 'white',
            background: 'rgba(0,0,0,0.8)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: `2px solid ${color}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            marginLeft: anchorX === 'left' ? '10px' : 0,
            marginRight: anchorX === 'right' ? '10px' : 0
          }}>
            {label}
            <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.8 }}>(CLICK)</div>
          </div>
        </Html>
      )}
    </group>
    </group>
  )
}

export default InteractiveObject
