import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Background: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Vertex Shader
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Fragment Shader for Twilight
  const fragmentShader = `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      // Twilight Gradient
      // Normalizing Y to -1 to 1 range
      float y = normalize(vPosition).y;

      // Colors
      vec3 skyTop = vec3(0.29, 0.23, 0.38); // Dark Purple #4b3b60
      vec3 horizon = vec3(0.9, 0.49, 0.13); // Warm Pumpkin #e67e22
      vec3 abyss = vec3(0.1, 0.1, 0.18); // Deep Blue/Purple #1a1a2e

      vec3 color;

      // Mix based on elevation
      if (y > 0.0) {
          // Sky: Horizon -> Top
          // pow(y, 0.6) pushes the horizon color up a bit for a softer glow
          color = mix(horizon, skyTop, pow(y, 0.6));
      } else {
          // Void: Horizon -> Abyss
          // pow(abs(y), 0.6) pushes the horizon color down a bit
          color = mix(horizon, abyss, pow(abs(y), 0.6));
      }

      // Extra Horizon Glow
      float horizonGlow = 1.0 - abs(y);
      horizonGlow = pow(horizonGlow, 8.0);
      color += vec3(0.2, 0.1, 0.05) * horizonGlow;

      // Stars
      // Visible mostly in the dark areas (top and bottom)
      float noise = fract(sin(dot(vUv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
      float starThreshold = 0.995;
      if (abs(y) > 0.3 && noise > starThreshold) {
          float twinkle = 0.5 + 0.5 * sin(time * 2.0 + noise * 20.0);
          color += vec3(twinkle) * (abs(y) - 0.3);
      }

      gl_FragColor = vec4(color, 1.0);
    }
  `

  const uniforms = useRef({
    time: { value: 0 }
  })

  useFrame((state) => {
    uniforms.current.time.value = state.clock.elapsedTime
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} scale={[1, 1, 1]}>
       <sphereGeometry args={[60, 32, 32]} />
       <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms.current}
          side={THREE.BackSide}
       />
    </mesh>
  )
}

export default Background
