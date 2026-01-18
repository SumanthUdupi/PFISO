import React, { useRef, useEffect } from 'react'
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WobbleMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uSpeed: 1,
    uStrength: 0.1,
    uFrequency: 2.0,
    color: new THREE.Color(0.0, 0.0, 0.0),
    uSSSIntensity: 0.5, // Subsurface scattering intensity
    uSheenIntensity: 0.2, // Sheen intensity for fabric-like materials
    uFingerprintScale: 10.0, // Scale for fingerprint noise
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uStrength;
    uniform float uFrequency;

    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      vec3 pos = position;

      // AN-03: Environmental Wobble
      // Equation: position.x += sin(uv.y * frequency + uTime) * uStrength
      // Applying primarily to top vertices (uv.y > 0.5 usually corresponds to top in box mapping depending on UVs,
      // but strictly following the equation provided:

      float time = uTime * uSpeed;

      // Dampen effect at the bottom (y=0 in local space usually, or low UV)
      // Assuming standard box UVs, y goes 0 to 1.
      // We want the base to stay still.
      float influence = smoothstep(0.0, 1.0, uv.y);

      pos.x += sin(uv.y * uFrequency + time) * uStrength * influence;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 color;
    varying vec3 vNormal;

    void main() {
      // Basic lighting approximation
      vec3 light = normalize(vec3(1.0, 1.0, 1.0));
      float dProd = max(0.0, dot(vNormal, light));

      // Mix base color with shadow/light
      vec3 finalColor = color * (0.5 + 0.5 * dProd);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

extend({ WobbleMaterialImpl })

interface WobbleMaterialProps {
  color?: string
  speed?: number
  strength?: number
  frequency?: number
  sssIntensity?: number
  sheenIntensity?: number
  fingerprintScale?: number
}

export const WobbleMaterial = (props: WobbleMaterialProps) => {
  const materialRef = useRef<any>(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.elapsedTime
    }
  })

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uSpeed = props.speed ?? 1
      materialRef.current.uStrength = props.strength ?? 0.1
      materialRef.current.uFrequency = props.frequency ?? 2.0
      materialRef.current.uSSSIntensity = props.sssIntensity ?? 0.5
      materialRef.current.uSheenIntensity = props.sheenIntensity ?? 0.2
      materialRef.current.uFingerprintScale = props.fingerprintScale ?? 10.0
      if (props.color) materialRef.current.color = new THREE.Color(props.color)
    }
  }, [props])

  return (
    <wobbleMaterialImpl
      ref={materialRef}
    />
  )
}
