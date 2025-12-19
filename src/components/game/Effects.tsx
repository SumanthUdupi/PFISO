import React from 'react'
import { EffectComposer, Bloom, Noise, Vignette, HueSaturation, Sepia } from '@react-three/postprocessing'

const Effects = () => {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        luminanceThreshold={1}
        mipmapBlur
        intensity={0.5}
        radius={0.4}
      />
      <Noise opacity={0.1} />
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
      <HueSaturation saturation={-0.2} />
      <Sepia intensity={0.2} />
    </EffectComposer>
  )
}

export default Effects
