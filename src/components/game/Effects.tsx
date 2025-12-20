import React from 'react'
import { EffectComposer, Bloom, HueSaturation } from '@react-three/postprocessing'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'

const Effects = () => {
  const { isMobile } = useDeviceDetect()

  if (isMobile) {
      return null
  }

  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom
        luminanceThreshold={0.8}
        mipmapBlur
        intensity={0.4}
        radius={0.4}
      />
      <HueSaturation saturation={0.1} />
    </EffectComposer>
  )
}

export default Effects
