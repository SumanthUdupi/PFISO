import React, { useRef, useEffect, useState } from 'react'
import { EffectComposer, Bloom, Vignette, Noise, BrightnessContrast, ChromaticAberration, SSAO, LUT, GodRays, DepthOfField, Outline } from '@react-three/postprocessing'
import { useFrame, useThree, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { ColorBlindnessEffect, BlendFunction } from 'postprocessing'
import useGameStore from '../../store'
import eventBus from '../../systems/EventBus'
import { useSettingsStore } from '../../stores/settingsStore'
import useAudioStore from '../../audioStore'

// Register external effects
extend({ ColorBlindnessEffect })

const HealthVignette = () => {
    const health = useGameStore(state => state.health)
    const isLowHealth = health < 30
    const time = useRef(0)

    useFrame((_, dt) => {
        time.current += dt
    })

    let darkness = 0.45
    if (isLowHealth) {
        const pulse = (Math.sin(time.current * 5) + 1) * 0.5
        darkness = 0.5 + pulse * 0.2
    }

    return <Vignette eskil={false} offset={0.3} darkness={darkness} />
}

const ImpactAberration = () => {
    const intensity = useRef(0)
    const abRef = useRef<any>(null)

    useEffect(() => {
        const onShake = (payload: any) => {
            const amount = payload.intensity || 0.5
            intensity.current = Math.min(intensity.current + amount * 0.05, 0.1)
        }
        eventBus.on('SCREEN_SHAKE', onShake)
        return () => eventBus.off('SCREEN_SHAKE', onShake)
    }, [])

    useFrame((_, dt) => {
        if (intensity.current > 0) {
            intensity.current = THREE.MathUtils.lerp(intensity.current, 0, dt * 5)
        }
        if (abRef.current) {
            const baseImperfection = 0.002
            abRef.current.offset.x = intensity.current + baseImperfection
            abRef.current.offset.y = intensity.current + baseImperfection
        }
    })

    return <ChromaticAberration ref={abRef} offset={new THREE.Vector2(0, 0)} radialModulation={false} modulationOffset={0} />
}

const AutoFocus = ({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3> }) => {
    const { camera, scene, raycaster } = useThree()

    useFrame((state, dt) => {
        // Raycast from center of screen
        raycaster.setFromCamera({ x: 0, y: 0 }, camera)

        const intersects = raycaster.intersectObjects(scene.children, true)

        // Find best hit
        // CS-022: Dynamic DOF Focus
        for (let i = 0; i < intersects.length; i++) {
            const hit = intersects[i]
            if (hit.distance > 0.5) {
                targetRef.current.lerp(hit.point, dt * 2) // Smooth transition
                break
            }
        }
    })
    return null
}

const WaterDroplets = () => {
    // CS-039: Water Droplets (Lens FX)
    // Simulating "Wet" look via subtle chromatic aberration modulation and noise
    const intensity = useRef(0)
    useFrame((state) => {
        const t = state.clock.elapsedTime
        intensity.current = (Math.sin(t * 0.5) + 1) * 0.002 // Subtle breathing
    })
    return <ChromaticAberration offset={new THREE.Vector2(intensity.current, intensity.current)} radialModulation={false} modulationOffset={0} />
}

const FOVDistortionFix = () => {
    // CS-040: FOV Distortion
    // Mitigating "Fisheye" look at high FOV by masking edges with a stronger vignette
    return <Vignette eskil={false} offset={0.1} darkness={0.6} />
}

const GlitchEffect = () => {
    // AUD-014: High Freq Noise (Glitch)
    // Listens for GLITCH event to trigger visual and audio glitch
    const [active, setActive] = useState(false)
    const timeoutRef = useRef<any>(null)

    useEffect(() => {
        const onGlitch = (payload: any) => {
            setActive(true)
            useAudioStore.getState().playSound('error') // High freq noise/glitch sound

            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                setActive(false)
            }, payload.duration || 300)
        }
        eventBus.on('GLITCH', onGlitch)
        return () => {
            eventBus.off('GLITCH', onGlitch)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <ChromaticAberration
            offset={new THREE.Vector2(0.05, 0.05)} // Strong aberration 
            radialModulation={false}
            modulationOffset={0}
        />
    )
}

const ColorBlindModeWrapper = () => {
    const mode = useSettingsStore(state => state.colorBlindMode)
    const { ColorBlindnessMode } = require('postprocessing')

    // Map our modes to postprocessing modes safely
    // 0: Normal, 1: Protanopia, 2: Deuteranopia, 3: Tritanopia, 4: Achromatopsia/Monochromacy
    let effectMode = 0
    if (mode === 'PROTANOPIA') effectMode = 1
    if (mode === 'DEUTERANOPIA') effectMode = 2
    if (mode === 'TRITANOPIA') effectMode = 3

    if (effectMode === 0) return null

    return <primitive object={new ColorBlindnessEffect({ mode: effectMode, opacity: 1.0 })} />
}

export const PostProcessingEffects: React.FC = () => {
    const [sunMesh, setSunMesh] = useState<THREE.Mesh | null>(null)
    const dofTarget = useRef(new THREE.Vector3(0, 0, 5))
    const qualityMode = useGameStore(state => state.qualityMode)

    if (qualityMode === 'low') {
        return (
            <>
                <EffectComposer disableNormalPass>
                    <BrightnessContrast brightness={0.02} contrast={0.1} />
                    {/* Keep Health Vignette for gameplay feedback */}
                    <HealthVignette />
                    <ColorBlindModeWrapper />
                </EffectComposer>
            </>
        )
    }

    return (
        <>
            <AutoFocus targetRef={dofTarget} />

            {/* Sun Mesh for GodRays */}
            <mesh ref={setSunMesh} position={[60, 40, 40]}>
                <sphereGeometry args={[5, 16, 16]} />
                <meshBasicMaterial color="#ffaa00" transparent opacity={1} />
            </mesh>

            <EffectComposer disableNormalPass>
                <SSAO radius={0.1} intensity={15} luminanceInfluence={0.5} color={undefined} resolutionScale={0.5} />

                <Bloom luminanceThreshold={1.0} mipmapBlur={true} intensity={0.4} radius={0.6} resolutionScale={0.5} />

                {sunMesh && (
                    <GodRays sun={sunMesh} blendFunction={THREE.BlendFunction.SCREEN} samples={30} density={0.95} decay={0.9} weight={0.4} exposure={0.6} clampMax={1} width={THREE.Resizer.AUTO_SIZE} height={THREE.Resizer.AUTO_SIZE} kernelSize={THREE.KernelSize.SMALL} blur={true} />
                )}

                <HealthVignette />
                <ImpactAberration />
                <GlitchEffect />
                <ColorBlindModeWrapper />

                {/* CS-039: Water Droplets */}
                <WaterDroplets />

                {/* CS-040: FOV Distortion Fix */}
                <FOVDistortionFix />

                <BrightnessContrast brightness={0.02} contrast={0.15} />
                <Noise opacity={0.03} premultiply />

                <Outline edgeStrength={2.5} edgeGlow={0.0} edgeThickness={1.0} pulseSpeed={0.0} visibleEdgeColor={0xffffff} hiddenEdgeColor={0xffffff} blur={false} xRay={true} />

                {/* CS-022: Dynamic Depth of Field */}
                <DepthOfField target={dofTarget.current} focalLength={0.02} bokehScale={2} height={480} />
            </EffectComposer>
        </>
    )
}
