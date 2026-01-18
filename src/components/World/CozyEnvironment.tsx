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
            });
        }
    }, []);


    // Static Golden Hour Lighting (Digital Hygge)
    useFrame(() => {
        // Golden Hour Direction
        // Low angle sun from the side/window
        const sunPos = new THREE.Vector3(60, 40, 40);

        if (dirLightRef.current) {
            dirLightRef.current.position.copy(sunPos);
            const saverMultiplier = batterySaver ? 0.5 : 1;

            // Warm Golden Sun
            dirLightRef.current.intensity = 2.5 * saverMultiplier;
            dirLightRef.current.color.setHSL(0.08, 0.6, 0.8); // Warm Orange-Yellow
        }

        // Ambient Light
        if (ambientRef.current) {
            const saverMultiplier = batterySaver ? 0.5 : 1;
            // Warm ambient to fill shadows
            ambientRef.current.intensity = 0.6 * saverMultiplier;
            ambientRef.current.color.setHex(0xffeebb); // Warm cream
        }
    });

    return (
        <>
            <ambientLight ref={ambientRef} intensity={0.6} />
            <directionalLight
                ref={dirLightRef}
                position={[60, 40, 40]}
                intensity={2.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0005}
            >
                <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
            </directionalLight>

            {/* Nice Office Floor - Warm Wood */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial
                    color="#8d6e63" // Warm brown
                    roughness={0.6}
                    metalness={0.0}
                />
            </mesh>

            {/* Grid Pattern - Very Subtle Warmth */}
            <gridHelper args={[100, 100, 0xd7ccc8, 0x8d6e63]} position={[0, 0.01, 0]} />

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
