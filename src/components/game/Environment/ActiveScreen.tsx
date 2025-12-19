import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 3.2 Active Computer Screens
// "Apply an animated texture to the face of monitor meshes"

const ActiveScreen = ({ position, rotation, size }: { position: [number, number, number], rotation: [number, number, number], size: [number, number, number] }) => {
    // We simulate animated texture with a shader or changing offset
    // Simple blinking cursor style

    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vec3 bgColor = vec3(0.0, 0.0, 0.2); // Dark blue
        vec3 txtColor = vec3(0.2, 0.8, 0.2); // Green text

        // Scanlines
        float scanline = sin(vUv.y * 100.0 + time * 10.0) * 0.1;

        // Blinking cursor
        float cursor = 0.0;
        if (vUv.x > 0.1 && vUv.x < 0.2 && vUv.y > 0.8 && vUv.y < 0.9) {
            cursor = step(0.5, fract(time * 2.0));
        }

        // Code lines (random noise stripes)
        float code = 0.0;
        if (vUv.y < 0.8) {
             float line = step(0.5, sin(vUv.y * 20.0));
             float char = step(0.3, fract(sin(dot(vUv * vec2(10.0, 50.0), vec2(12.9898, 78.233))) * 43758.5453));
             code = line * char;
        }

        vec3 color = bgColor + txtColor * (cursor + code * 0.5) + vec3(scanline);
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const uniforms = useRef({ time: { value: 0 } })

    useFrame((state) => {
        uniforms.current.time.value = state.clock.elapsedTime
    })

    return (
        <mesh position={position} rotation={rotation}>
            <planeGeometry args={size} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms.current}
            />
        </mesh>
    )
}

export default ActiveScreen
