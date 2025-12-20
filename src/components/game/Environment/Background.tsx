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

      // Colors (REQ-012: Increased saturation and contrast)
      // Original: #4b3b60 -> rgb(0.29, 0.23, 0.38)
      // New: #5D437A -> more saturated purple
      vec3 skyTop = vec3(0.36, 0.26, 0.48);

      // Original: #e67e22 -> rgb(0.9, 0.49, 0.13)
      // New: #FF8C00 -> DarkOrange (more vibrant)
      vec3 horizon = vec3(1.0, 0.55, 0.0);

      // Original: #1a1a2e -> rgb(0.1, 0.1, 0.18)
      // New: #121228 -> Darker, deeper blue
      vec3 abyss = vec3(0.07, 0.07, 0.16);

      // Intermediate color for richer gradient (Req 12)
      vec3 midSky = vec3(0.7, 0.3, 0.3); // Deep pinkish/red transition

      vec3 color;

      // Mix based on elevation
      if (y > 0.0) {
          // Sky: Horizon -> Mid -> Top
          if (y < 0.5) {
             color = mix(horizon, midSky, pow(y * 2.0, 0.8));
          } else {
             color = mix(midSky, skyTop, pow((y - 0.5) * 2.0, 0.8));
          }
      } else {
          // Void: Horizon -> Abyss
          color = mix(horizon, abyss, pow(abs(y), 0.6));
      }

      // Extra Horizon Glow
      float horizonGlow = 1.0 - abs(y);
      horizonGlow = pow(horizonGlow, 8.0);
      color += vec3(0.3, 0.15, 0.05) * horizonGlow; // Boosted glow

      // Stars (REQ-021: Variation)
      // Visible mostly in the dark areas (top and bottom)
      float noise = fract(sin(dot(vUv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
      // Secondary noise for size/brightness variation
      float sizeNoise = fract(sin(dot(vUv * 50.0, vec2(34.123, 12.543))) * 23421.123);

      float starThreshold = 0.992; // Slightly more stars
      if (abs(y) > 0.2 && noise > starThreshold) {
          float speed = 1.0 + sizeNoise * 3.0; // Random twinkle speed
          float twinkle = 0.5 + 0.5 * sin(time * speed + noise * 20.0);

          // Color variation (slightly blue or white)
          vec3 starColor = mix(vec3(0.8, 0.8, 1.0), vec3(1.0), sizeNoise);

          // Brightness based on noise (size)
          float brightness = sizeNoise > 0.8 ? 1.5 : 0.8;

          color += starColor * twinkle * brightness * (abs(y) - 0.2);
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
