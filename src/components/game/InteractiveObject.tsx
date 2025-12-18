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
        <Html position={[0, 1.5, 0]} center>
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
            transform: 'translate3d(0,0,0)'
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
