import React from 'react'
import { EffectComposer, Bloom, HueSaturation, Outline, ChromaticAberration, SSAO, Vignette } from '@react-three/postprocessing'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import * as THREE from 'three'
import useCameraStore from '../../stores/cameraStore'
import { useFrame } from '@react-three/fiber'

const Effects = () => {
  const { isMobile } = useDeviceDetect()
  const { getShake } = useCameraStore()
  const caRef = React.useRef<any>(null)

  useFrame(() => {
    if (caRef.current) {
      const shake = getShake()
      // MECH-028: Chromatic Aberration Pulse based on trauma
      const offsetVal = 0.002 + shake * 0.05

      // Safe update of offset
      if (caRef.current.offset && typeof caRef.current.offset.set === 'function') {
        caRef.current.offset.set(offsetVal, offsetVal)
      } else {
        // Fallback if it's an array or simple property
        caRef.current.offset = [offsetVal, offsetVal]
      }
    }
  })

  if (isMobile) {
    return null
  }

  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        luminanceThreshold={0.85}
        mipmapBlur
        intensity={0.6}
        radius={0.5}
      />
      <SSAO
        radius={0.4}
        intensity={50}
        luminanceInfluence={0.4}
        color={undefined}
      />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      <HueSaturation saturation={0.2} hue={-0.05} />

      {/* MECH-014: Object Highlight / Outline Shader */}
      <Outline
        blur
        edgeStrength={2.5}
        width={1000}
        visibleEdgeColor={0xffffff}
        hiddenEdgeColor={0xffffff}
        xRay={false}
      />

      {/* MECH-028 */}
      <ChromaticAberration
        ref={caRef}
        offset={[0.002, 0.002]} // Initial low value
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  )
}

export default Effects
