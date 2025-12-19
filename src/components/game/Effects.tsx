import React from 'react'
import { EffectComposer, Bloom, Noise, Vignette, HueSaturation, Sepia } from '@react-three/postprocessing'

const Effects = () => {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        luminanceThreshold={0.8}
        mipmapBlur
        intensity={0.4}
        radius={0.4}
      />
      {/* Noise and Sepia removed for a cleaner look */}
      <Vignette eskil={false} offset={0.1} darkness={0.3} />
      <HueSaturation saturation={0.1} />
    </EffectComposer>
  )
}

export default Effects
