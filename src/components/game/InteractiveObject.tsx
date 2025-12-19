import React, { useState } from 'react'
import { Html, Float } from '@react-three/drei'
import * as THREE from 'three'

interface InteractiveObjectProps {
  position: [number, number, number]
  color?: string
  label: string
  onClick: () => void
}

const InteractiveObject: React.FC<InteractiveObjectProps> = ({ position, color = '#7ED321', label, onClick }) => {
  const [hovered, setHovered] = useState(false)

  const [anchorX, setAnchorX] = useState<'center' | 'left' | 'right'>('center')

  // Calculate position logic for tooltips
  const calculatePosition = (el: Object3D, camera: Camera, size: { width: number; height: number }) => {
     // This is a simplified logic. In a real 3D scenario, we might want to project the vector.
     // However, `drei/Html` handles positioning. We just want to know if it's near the edge.
     // Since `Html` is already positioned in 3D, we can use the `style` to adjust or rely on `drei`'s calculatePosition if we override it,
     // but to dynamically change anchor based on screen position requires manual projection.

     // For now, we will use a simpler heuristic based on the object's position relative to the center.
     // If X > 0 (right side), we anchor "right" (tooltip goes to left).
     // If X < 0 (left side), we anchor "left" (tooltip goes to right).
     // This prevents it from going off-screen in a centered isometric view.

     if (position[0] > 2) return 'right'
     if (position[0] < -2) return 'left'
     return 'center'
  }

  // We can just compute this once or on mount since objects are static
  React.useEffect(() => {
     if (position[0] > 2) setAnchorX('right')
     else if (position[0] < -2) setAnchorX('left')
     else setAnchorX('center')
  }, [position])

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
    <group position={position}>
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

      {/* Interaction Indicator Ring */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {hovered && (
        <Html position={[0, 1.5, 0]} center={anchorX === 'center'} style={{
            transform: anchorX === 'left' ? 'translateX(0%)' : anchorX === 'right' ? 'translateX(-100%)' : 'translateX(-50%)',
            pointerEvents: 'none'
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
    </Float>
  )
}

export default InteractiveObject
