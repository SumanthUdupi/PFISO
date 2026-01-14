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

  // Fragment Shader for Cozy Pastel Void
  const fragmentShader = `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Simplex noise function (approx)
    float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Normalize Y
      float y = normalize(vPosition).y;

      // COZY PASTEL PALETTE
      // WARM SUNSET PALETTE
      vec3 skyTop = vec3(0.45, 0.35, 0.4);   // Warm Muted Mauve
      vec3 midSky = vec3(0.8, 0.6, 0.5);     // Muted Coral/Salmon
      vec3 horizon = vec3(0.95, 0.85, 0.7);  // Warm Parchment/Gold
      vec3 abyss = vec3(0.15, 0.1, 0.1);     // Deep Cocoa

      vec3 color;

      if (y > 0.0) {
          // Sky gradient
          color = mix(horizon, skyTop, pow(y, 0.8));
          // Add mid-tone
          float midMix = smoothstep(0.2, 0.7, y);
          color = mix(mix(horizon, midSky, y*2.0), skyTop, midMix);
      } else {
          // Abyss gradient
          color = mix(horizon, abyss, pow(abs(y), 0.6));
      }

      // Dithering / Film Grain for "Atmosphere"
      float noise = random(vUv * 300.0 + time * 0.1);
      color += (noise - 0.5) * 0.01; // Very subtle grain

      // Soft Stars (fewer, warmer)
      if (abs(y) > 0.3 && random(vUv * 50.0) > 0.99) {
          float twinkle = sin(time * 2.0 + vUv.x * 10.0) * 0.5 + 0.5;
          color += vec3(1.0, 0.95, 0.8) * twinkle * 0.4; // Warm white stars
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
