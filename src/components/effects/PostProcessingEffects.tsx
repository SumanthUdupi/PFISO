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

const AutoFocusDOF = () => {
    const { scene, camera } = useThree()
    const raycaster = new THREE.Raycaster()
    const screenCenter = new THREE.Vector2(0, 0)
    const focusDist = useRef(5) // Default focus at 5m
    const dofRef = useRef<any>(null)

    useFrame((_, delta) => {
        // Raycast from center
        raycaster.setFromCamera(screenCenter, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)
        let targetDist = 5

        if (intersects.length > 0) {
            targetDist = intersects[0].distance
        }

        if (targetDist < 1.0) targetDist = 1.0

        focusDist.current = THREE.MathUtils.lerp(focusDist.current, targetDist, delta * 2.0)

        if (dofRef.current) {
            dofRef.current.target = new THREE.Vector3(0, 0, -focusDist.current).applyMatrix4(camera.matrixWorld)
        }
    })

    return (
        <DepthOfField
            ref={dofRef}
            target={[0, 0, 5]} // Default target
            focalLength={0.05} // Narrower lens, less blur
            bokehScale={2} // Smaller bokeh
            height={480}
        />
    )
}

export const PostProcessingEffects: React.FC = () => {
    const { isMobile } = useDeviceDetect()

    return (
        <EffectComposer disableNormalPass>
            {/* Soft Bloom - Very subtle */}
            <Bloom
                luminanceThreshold={0.95}
                mipmapBlur={!isMobile}
                intensity={0.4}
                radius={0.4}
            />

            {/* REQ-032: Auto Focus Depth of Field */}
            {!isMobile ? <AutoFocusDOF /> : <></>}

            {/* REQ-034: Vignette - Dynamic based on Health */}
            <HealthVignette />

            {/* REQ-035: Impact FX */}
            <ImpactAberration />

            {/* Subtle Grain - Very low */}
            {!isMobile ? <Noise opacity={0.01} /> : <></>}

            {/* Bright & Cozy Adjustment */}
            <BrightnessContrast
                brightness={0.1}
                contrast={0.05}
            />
        </EffectComposer>
    )
}
