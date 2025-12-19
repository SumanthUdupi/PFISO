import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 3.1 Animated Decorative Backgrounds
// "Add visual interest to the background layer."
// "Place a large plane behind the room geometry."

const Background: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Vertex Shader
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // Fragment Shader for Day/Night cycle
  const fragmentShader = `
    uniform float time;
    varying vec2 vUv;

    void main() {
      // Simple gradient
      float t = time * 0.05; // Slow cycle

      // Cycle between Day (Blue/Cyan) and Night (Purple/Black)
      vec3 dayTop = vec3(0.4, 0.7, 1.0);
      vec3 dayBot = vec3(0.7, 0.9, 1.0);

      vec3 nightTop = vec3(0.05, 0.05, 0.2);
      vec3 nightBot = vec3(0.2, 0.1, 0.4);

      float cycle = 0.5 + 0.5 * sin(t); // 0 to 1

      vec3 top = mix(nightTop, dayTop, cycle);
      vec3 bot = mix(nightBot, dayBot, cycle);

      vec3 color = mix(bot, top, vUv.y);

      // Stars (only at night)
      float noise = fract(sin(dot(vUv * 50.0, vec2(12.9898, 78.233))) * 43758.5453);
      if (cycle < 0.3 && noise > 0.99) {
          float twinkle = 0.5 + 0.5 * sin(time * 5.0 + noise * 10.0);
          color += vec3(twinkle);
      }

      // Clouds (scrolling)
      float cloudNoise = fract(sin(dot((vUv + vec2(time * 0.01, 0.0)) * 5.0, vec2(12.9898, 78.233))) * 43758.5453);
      if (cloudNoise > 0.6) {
          color += vec3(0.1) * cycle;
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
    // Place far behind. Camera at 20,20,20 looking at 0,0,0.
    // Direction (-1,-1,-1).
    // Place at -50, -50, -50 relative to origin?
    // Or just a huge sphere surrounding? Or a plane facing camera.
    // Since it's orthographic, a plane perpendicular to camera vector is best.
    // Camera rotation is looked at 0,0,0.
    // We can just use LookAt on the mesh.
    <mesh ref={meshRef} position={[-20, -10, -20]} rotation={[0, Math.PI / 4, 0]} scale={[2, 2, 2]}>
       <planeGeometry args={[200, 100]} />
       <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms.current}
          side={THREE.DoubleSide}
       />
    </mesh>
  )
}

export default Background
