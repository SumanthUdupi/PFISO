import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FlickeringLightProps {
  position: [number, number, number]
  color?: string
  intensity?: number
  flickerStrength?: number
  flickerSpeed?: number
  castShadow?: boolean
  shadowMapSize?: [number, number]
}

const FlickeringLight: React.FC<FlickeringLightProps> = ({
  position,
  color = '#ffffff',
  intensity = 1,
  flickerStrength = 0.1,
  flickerSpeed = 0.5,
  castShadow = false,
  shadowMapSize = [1024, 1024]
}) => {
  const lightRef = useRef<THREE.DirectionalLight>(null)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      // LT-01: Light Source Flicker
      // Irregular flicker
      if (Math.random() < flickerSpeed) {
        lightRef.current.intensity = intensity + (Math.random() - 0.5) * flickerStrength
      } else {
        // Slowly return to base intensity
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, intensity, 0.1)
      }
    }
  })

  return (
    <directionalLight
      ref={lightRef}
      position={position}
      color={color}
      intensity={intensity}
      castShadow={castShadow}
      shadow-mapSize={shadowMapSize}
    >
        {castShadow && <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15]} />}
    </directionalLight>
  )
}

export default FlickeringLight
