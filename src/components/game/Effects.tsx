import React from 'react'
import { EffectComposer, Bloom, HueSaturation, Outline, SSAO, Vignette } from '@react-three/postprocessing'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import * as THREE from 'three'


const Effects = () => {
  const { isMobile } = useDeviceDetect()



  if (isMobile) {
    return null
  }

  return (
    <EffectComposer multisampling={0}>
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
      <Vignette eskil={false} offset={0.1} darkness={0.3} />
      <HueSaturation saturation={0.1} hue={0} />

      {/* MECH-014: Object Highlight / Outline Shader */}
      <Outline
        blur
        edgeStrength={2.5}
        width={1000}
        visibleEdgeColor={0xffffff}
        hiddenEdgeColor={0xffffff}
        xRay={false}
      />
    </EffectComposer>
  )
}

export default Effects
