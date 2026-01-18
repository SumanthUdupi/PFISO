import React, { useRef, useEffect } from 'react'
import { EffectComposer, Bloom, Vignette, Noise, BrightnessContrast, DepthOfField, ChromaticAberration } from '@react-three/postprocessing'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../../store'
import eventBus from '../../systems/EventBus'

const HealthVignette = () => {
    const health = useGameStore(state => state.health)

    // REQ-034: Low Health Vignette
    // Below 30% health, pulse darkness.
    const isLowHealth = health < 30
    const time = useRef(0)

    useFrame((_, dt) => {
        time.current += dt
    })

    // Calculate darkness
    let darkness = 0.2

    if (isLowHealth) {
        // Pulse between 0.4 and 0.6
        const pulse = (Math.sin(time.current * 5) + 1) * 0.5 // 0..1
        darkness = 0.4 + pulse * 0.2
    }

    return (
        <Vignette
            eskil={false}
            offset={0.1}
            darkness={darkness}
        />
    )
}

const ImpactAberration = () => {
    const intensity = useRef(0)
    const abRef = useRef<any>(null)

    useEffect(() => {
        const onShake = (payload: any) => {
            // REQ-035: Chromatic Aberration Spike
            const amount = payload.intensity || 0.5
            // Add to intensity
            intensity.current = Math.min(intensity.current + amount * 0.05, 0.1) // Cap at 0.1 offset
        }
        eventBus.on('SCREEN_SHAKE', onShake)
        return () => eventBus.off('SCREEN_SHAKE', onShake)
    }, [])

    useFrame((_, dt) => {
        if (intensity.current > 0) {
            intensity.current = THREE.MathUtils.lerp(intensity.current, 0, dt * 5)
        }

        if (abRef.current) {
            // ChromaticAberrationImpl 'offset' is Vector2
            abRef.current.offset.x = intensity.current
            abRef.current.offset.y = intensity.current
        }
    })

    return (
        <ChromaticAberration
            ref={abRef}
            offset={new THREE.Vector2(0, 0)} // Fix Type
            radialModulation={false}
            modulationOffset={0}
        />
    )
}

export const PostProcessingEffects: React.FC = () => {
    const { isMobile } = useDeviceDetect()

    return (
        <EffectComposer disableNormalPass>
            {/* Soft Bloom - Reduced for clarity */}
            <Bloom
                luminanceThreshold={0.95}
                mipmapBlur={!isMobile}
                intensity={0.2}
                radius={0.2}
            />

            {/* REQ-034: Vignette - Dynamic based on Health */}
            <HealthVignette />

            {/* REQ-035: Impact FX */}
            <ImpactAberration />

            {/* Bright & Cozy Adjustment */}
            <BrightnessContrast
                brightness={0.05}
                contrast={0.1}
            />
        </EffectComposer>
    )
}
