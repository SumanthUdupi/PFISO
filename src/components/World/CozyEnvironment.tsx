import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OfficeDesk, OfficeChair, OfficePlant, OfficeWall } from "../game/Environment/OfficeAssets";

export const CozyEnvironment: React.FC = () => {
    const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
    const ambientRef = useRef<THREE.AmbientLight>(null);

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
                // Return cleanup not used for promises usually but safe here
            });
        }
    }, []);


    // Day/Night Cycle State
    // 0 = Noon, 0.25 = Sunset, 0.5 = Midnight, 0.75 = Sunrise
    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const cycleDuration = 300; // 5 minutes per day for office feel
        const dayTime = (time % cycleDuration) / cycleDuration;

        // Calculate Sun Position based on time
        const phi = 2 * Math.PI * (dayTime - 0.5); // -PI to PI
        const x = 100 * Math.cos(phi);
        const y = 100 * Math.sin(phi);
        const z = 20;

        const isDay = y > 0;

        // Update Directional Light (Sun/Moon)
        if (dirLightRef.current) {
            dirLightRef.current.position.set(x, y, z);
            const saverMultiplier = batterySaver ? 0.5 : 1;

            // Smoother office lighting
            if (isDay) {
                dirLightRef.current.intensity = THREE.MathUtils.lerp(0.8, 2.5, Math.sin(phi)) * saverMultiplier;
                // Soft Warm Sun
                dirLightRef.current.color.setHSL(0.1, 0.5, 0.95);
            } else {
                // Night (Office night mode)
                dirLightRef.current.intensity = 0.3 * saverMultiplier;
                dirLightRef.current.color.setHSL(0.6, 0.2, 0.2);
            }
        }

        // Ambient Light
        if (ambientRef.current) {
            const saverMultiplier = batterySaver ? 0.5 : 1;
            // Office usually has good ambient light
            const ambInt = (isDay ? 0.8 : 0.3) * saverMultiplier;
            ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, ambInt, 0.01);
            if (!isDay) ambientRef.current.color.setHex(0x263238); // Blue grey night
            else ambientRef.current.color.setHex(0xffffff);
        }
    });

    return (
        <>
            <ambientLight ref={ambientRef} intensity={0.8} />
            <directionalLight
                ref={dirLightRef}
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Nice Office Floor - Warm Wood */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#8d6e63" // Warm brown
                    roughness={0.6}
                    metalness={0.0}
                />
            </mesh>

            {/* Grid Pattern to prevent "rotation" illusion - Subtle */}
            <gridHelper args={[100, 100, 0xbcaaa4, 0x8d6e63]} position={[0, 0.01, 0]} />

            {/* Office Walls */}
            <OfficeWall position={[0, 1.5, -10]} width={20} />
            <OfficeWall position={[-10, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} width={20} />

            {/* Furniture */}
            <OfficeDesk position={[0, 0, -5]} />
            <OfficeChair position={[0, 2, -3]} />
            <OfficePlant position={[3, 1, -8]} />

        </>
    );
};
