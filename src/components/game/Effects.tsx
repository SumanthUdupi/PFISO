import { EffectComposer, Bloom, Outline, SSAO, Vignette } from '@react-three/postprocessing'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'


const Effects = () => {
  const { isMobile } = useDeviceDetect()



  if (isMobile) {
    return null
  }

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={1.1} // Raised to prevent background blowout
        mipmapBlur={false} // Disabled for sharper focus
        intensity={0.1}
        radius={0.3}
      />
      <SSAO
        radius={0.1}
        intensity={5}
        luminanceInfluence={0.4}
        color={undefined}
        worldDistanceThreshold={10}
        worldDistanceFalloff={10}
        worldProximityThreshold={1}
        worldProximityFalloff={1}
      />
      <Vignette eskil={false} offset={0.1} darkness={0.2} />
      {/* HueSaturation disabled to prevent color shifting artifacts */}
      {/* <HueSaturation saturation={0.2} hue={0} /> */}

      {/* MECH-014: Object Highlight / Outline Shader - Darker Edges */}
      <Outline
        blur
        edgeStrength={2.5}
        width={1000}
        visibleEdgeColor={0x4a4a4a} // Dark Gray Outline
        hiddenEdgeColor={0x4a4a4a}
        xRay={false}
      />
    </EffectComposer>
  )
}

export default Effects
