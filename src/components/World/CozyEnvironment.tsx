import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OfficeDesk, OfficeChair, OfficePlant, OfficeWall, GlassPartition, PaperStack, TrashCan, OfficeCable } from "../game/Environment/OfficeAssets";

import { Environment, SoftShadows, Sparkles, MeshReflectorMaterial, ContactShadows, useTexture } from "@react-three/drei";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib";

export const CozyEnvironment: React.FC = () => {
    // VIS-034: Area Lights
    useEffect(() => {
        RectAreaLightUniformsLib.init();
    }, []);
    const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
    // const ambientRef = useRef<THREE.AmbientLight>(null); // Removed unused ref

    // Battery Saver Detection
    const [batterySaver, setBatterySaver] = useState(false);

    // Battery Saver Detection
    useEffect(() => {
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((battery: any) => {
                const checkBattery = () => {
                    const lowBattery = battery.level < 0.2 && !battery.charging;
                    setBatterySaver(lowBattery);
                };
                checkBattery();
                battery.addEventListener('levelchange', checkBattery);
                battery.addEventListener('chargingchange', checkBattery);
            });
        }
    }, []);


    // Static Golden Hour Lighting (Digital Hygge)
    useFrame((state) => {
        // Golden Hour Direction with Animation - REQ-VIS-025
        // Low angle sun from the side/window, swaying slowly
        const t = state.clock.elapsedTime * 0.1;
        const sunPos = new THREE.Vector3(60 + Math.sin(t) * 5, 40, 40 + Math.cos(t) * 5);

        if (dirLightRef.current) {
            dirLightRef.current.position.copy(sunPos);
            const saverMultiplier = batterySaver ? 0.5 : 1;

            // Warm Golden Sun
            dirLightRef.current.intensity = 2.0 * saverMultiplier;
            dirLightRef.current.color.setHSL(0.08, 0.6, 0.9); // Warm Orange-Yellow
        }
    });

    return (
        <>
            {/* Soft Shadows - REQ-VIS-010 */}
            <SoftShadows size={10} samples={6} focus={0.5} />

            {/* Contact Shadows - REQ-VIS-021 */}
            <ContactShadows
                opacity={0.4}
                scale={50}
                blur={2}
                far={10}
                resolution={128}
                color="#000000"
            />

            {/* Fog for Atmosphere - REQ-VIS-003 */}
            {/* CL-030: Fog Outdoor Clip - Reduced far clip to blend better or use FogExp2 for softer falloff? 
                Actually, to prevent hard clip, we just adjust start/end. 
                Using standard fog for performance. Adjusted range to [5, 40] from [10, 50] to be denser/softer? 
                Or larger range [0, 60] for smoother gradient? */}
            {/* Fog for Atmosphere - REQ-VIS-003: Volumetric-like FogExp2 */}
            <fogExp2 attach="fog" args={['#d7ccc8', 0.02]} />

            {/* Dust Particles - REQ-VIS-011 */}
            <Sparkles count={50} scale={12} size={6} speed={0.4} opacity={0.2} color="#ffffff" />

            {/* Ambient Light replaced with HemisphereLight - REQ-VIS-002 */}
            <hemisphereLight
                color="#ffe0b2" // Sky color (warm)
                groundColor="#5d4037" // Ground color (dark warm)
                intensity={0.6}
            />

            <directionalLight
                ref={dirLightRef}
                position={[60, 40, 40]}
                intensity={2.0}
                castShadow
                shadow-mapSize-width={4096}
                shadow-mapSize-height={4096}
                shadow-bias={-0.0001} // REQ-VIS-001: Tuned shadow bias to -0.0001 to prevent peter-panning
                shadow-normalBias={0.02} // CL-012: Added normalBias to hide acne
            >
                {/* CS-038: Shadow Pop-in - Increase bounds to cover movement */}
                <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
            </directionalLight>

            {/* HDRI Environment for Reflections & GI */}
            {/* VIS-040: Skybox - Enable background for window view */}
            <Environment preset="city" background={true} blur={0.8} frames={1} />

            {/* Nice Office Floor - Warm Wood with Reflection - REQ-VIS-004 & REQ-VIS-014 */}
            <FloorWithTexture />

            {/* VIS-033: Ceiling - Closed Environment */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#eceff1" side={THREE.DoubleSide} />
            </mesh>

            {/* VIS-042: Cables/Wires - Add visual clutter */}
            <group position={[0.5, 0.05, 0.5]} rotation={[0, 0.5, 0]}>
                <OfficeCable position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
                <OfficeCable position={[0.5, 0, 0.5]} rotation={[0, 1, Math.PI / 2]} />
            </group>

            {/* VIS-046: Decals/Papers - Scattered clutter */}
            <PaperStack position={[2, 0.1, 2]} rotation={[0, 0.5, 0]} />
            <PaperStack position={[-2, 0.1, -2]} rotation={[0, -0.2, 0]} />

            {/* VIS-043: Wear & Tear - Simple grunge decal on floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.02, 2]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color="#5d4037" transparent opacity={0.3} roughness={1} blending={THREE.MultiplyBlending} />
            </mesh>

            {/* 
               We extract floor to component to use Texture hook safely/cleanly
               if we wanted, but since we are in a component, we can just use hooks at top.
             */}

            {/* Grid Pattern - Very Subtle Warmth - REQ-VIS-020: Hidden */ }
    {/* <gridHelper args={[100, 100, 0xd7ccc8, 0x8d6e63]} position={[0, 0.01, 0]} /> */ }

    {/* Office Walls */ }
    <OfficeWall position={[0, 1.5, -10]} width={20.5} /> {/* REQ-VIS-030: Fix Leaks (Overlap) */ }
    <OfficeWall position={[-10, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} width={20.5} />

    {/* Furniture */ }
            <OfficeDesk position={[0, 0, -5]} />
            <OfficeChair position={[0, 2, -3]} />
            <OfficePlant position={[3, 1, -8]} />
    {/* REQ-VIS-048: Trash Can */ }
    <TrashCan position={[0.8, 0.2, -5.5]} />

    {/* REQ-VIS-026: Glass Partition */ }
    <GlassPartition position={[-5, 1.25, -2]} rotation={[0, 0.3, 0]} />

    {/* REQ-VIS-050: Rain on Glass (Outside Window) */ }
    {/* CL-029: Rain Indoor Clip - Ensure position is strictly outside and scale doesn't bleed inside */ }
    {/* Original scale [10, 5, 5] at [-8, 2, -2] (Glass at -5). -8 + 5 = -3 (Clip inside). */ }
    {/* Reduced scale X to 4. Position [-8]. Range [-6, -10]. Safe from -5. */ }
    <Sparkles
        count={200}
        scale={[4, 5, 5]}
        position={[-8, 2, -2]}
        size={4}
        speed={2}
        opacity={0.5}
        color="#b3e5fc"
    />

    {/* REQ-VIS-028: Paper Stack (On Desk?) */ }
    {/* Placing near desk, adjusting coords to be on top of desk (y=0.75 is top) */ }
    <PaperStack position={[0.5, 0.8, -5]} />

    {/* REQ-VIS-029: Lens Flares (Simulated via intense sparkle at sun pos) */ }
    <Sparkles count={3} scale={1} size={50} speed={0} opacity={0.8} position={[60, 40, 40]} color="#fff9c4" />

        </>
    );
};

const FloorWithTexture = () => {
    const texture = useTexture('assets/paper-texture.png')
    texture.wrapS = texture.wrapT = 1000
    texture.repeat.set(100, 100)

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <MeshReflectorMaterial
                blur={[400, 400]}
                resolution={1024}
                mixBlur={1}
                mixStrength={10}
                roughness={0.5}
                depthScale={1}
                minDepthThreshold={0.8}
                maxDepthThreshold={1.2}
                color="#8d6e63"
                metalness={0.2}
                mirror={0.5}
                depthToBlurRatioBias={0.25}
                roughnessMap={texture}
            />
        </mesh>
    )
}
