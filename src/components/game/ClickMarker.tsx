import React, { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ClickMarkerProps {
  position: THREE.Vector3
  onComplete: () => void
}

const ClickMarker: React.FC<ClickMarkerProps> = ({ position, onComplete }) => {
  const mesh = useRef<THREE.Mesh>(null)
  const [scale, setScale] = useState(0)
  const [opacity, setOpacity] = useState(1)

  useFrame((state, delta) => {
    // Expand
    if (scale < 1.5) {
      setScale(s => s + delta * 5)
    } else {
      // Fade out
      setOpacity(o => o - delta * 3)
    }

    if (opacity <= 0) {
      onComplete()
    }
  })

  return (
    <mesh
      ref={mesh}
      position={[position.x, 0.02, position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scale, scale, 1]}
    >
      <ringGeometry args={[0.3, 0.4, 16]} />
      <meshBasicMaterial color="#3498DB" transparent opacity={opacity} depthTest={false} />
    </mesh>
  )
}

export default ClickMarker
