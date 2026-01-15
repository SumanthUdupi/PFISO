import React from 'react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export const PostProcessingEffects: React.FC = () => {
    return (
        <EffectComposer disableNormalPass>
            {/* Bloom: Makes glowing materials (emissive > threshold) glow */}
            <Bloom
                luminanceThreshold={1} // Only very bright things glow
                mipmapBlur // Smooths the glow
                intensity={1.5}
                radius={0.6}
            />

            {/* Vignette: Darkens corners for cinematic feel */}
            <Vignette
                eskil={false}
                offset={0.1}
                darkness={0.5}
            />
        </EffectComposer>
    )
}
