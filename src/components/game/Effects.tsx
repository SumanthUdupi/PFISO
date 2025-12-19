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
      {/* Noise, Sepia, and Vignette removed for a cleaner look */}
      <HueSaturation saturation={0.1} />
    </EffectComposer>
  )
}

export default Effects
