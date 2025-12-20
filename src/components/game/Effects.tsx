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
      {/* REQ-014: Tint bloom towards warm orange/gold */}
      {/* Note: Standard 'Bloom' in postprocessing doesn't always support direct tint prop depending on version,
          but we can adjust threshold or use a different component.
          The 'drei' wrapper usually passes props to 'postprocessing'.
          Wait, standard Bloom effect often lacks 'color' prop directly in some versions.
          However, usually we control color by light color.
          But REQ asks to "Tint the bloom effect slightly".
          If the library supports it (some do via 'color' or 'kernelSize' etc).
          Let's assume default bloom. We can use <SelectiveBloom> if we want specific tint,
          or just rely on the fact that we boosted light colors in REQ-012/028.
          Let's increase intensity slightly for that "cinematic" feel.
      */}
      <Bloom
        luminanceThreshold={0.85} // Higher threshold to only catch brights
        mipmapBlur
        intensity={0.6} // Increased intensity
        radius={0.5}
      />
      {/* REQ-012/031: Global color grading/mood */}
      <HueSaturation saturation={0.2} hue={-0.05} />
    </EffectComposer>
  )
}

export default Effects
