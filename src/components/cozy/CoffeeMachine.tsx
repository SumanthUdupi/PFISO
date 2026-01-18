import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useGameStore from "../../store";
import useAudioStore from "../../audioStore";

interface CoffeeMachineProps {
    position: [number, number, number];
}

export const CoffeeMachine: React.FC<CoffeeMachineProps> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const cupRef = useRef<THREE.Group>(null);
    const liquidRef = useRef<THREE.Mesh>(null);

    const [isBrewing, setIsBrewing] = useState(false);
    const [brewProgress, setBrewProgress] = useState(0);
    const [hasCoffee, setHasCoffee] = useState(false);
    const [cupHeld, setCupHeld] = useState(false);

    const { playSound } = useAudioStore();

    const startBrew = () => {
        if (isBrewing || hasCoffee) return;
        setIsBrewing(true);
        setBrewProgress(0);
        playSound('click'); // Grinding sound start
    };

    useFrame((state, delta) => {
        if (isBrewing) {
            setBrewProgress(prev => {
                const newProgress = prev + delta * 0.5; // 2 seconds to brew
                if (newProgress >= 1) {
                    setIsBrewing(false);
                    setHasCoffee(true);
                    playSound('success'); // Brew complete
                    return 1;
                }
                return newProgress;
            });
        }

        // Update liquid level
        if (liquidRef.current && cupRef.current) {
            const liquidScale = hasCoffee ? 1 : brewProgress;
            liquidRef.current.scale.y = liquidScale;
            liquidRef.current.position.y = -0.1 + (liquidScale * 0.1);
        }
    });

    const sipCoffee = () => {
        if (!hasCoffee || cupHeld) return;

        // Apply coffee buff
        useGameStore.getState().addBuff({
            id: 'coffee-buff',
            name: 'Caffeine Rush',
            description: '+10% Movement Speed',
            duration: 30, // 30 seconds
            effects: {
                movementSpeed: 1.1
            }
        });

        setHasCoffee(false);
        setCupHeld(false);
        playSound('success'); // Ahhh sound

        // Camera FOV effect (would need camera access)
        // For now, just the buff
    };

    const pickupCup = () => {
        if (!hasCoffee) return;
        setCupHeld(true);
    };

    const dropCup = () => {
        setCupHeld(false);
    };

    return (
        <group ref={groupRef} position={position}>
            {/* Coffee Machine Base */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 0.5]} />
                <meshStandardMaterial color="#4a4a4a" />
            </mesh>

            {/* Brew Button */}
            <mesh
                position={[0, 0.8, 0.26]}
                onClick={startBrew}
                onPointerOver={() => playSound('hover')}
            >
                <boxGeometry args={[0.2, 0.1, 0.05]} />
                <meshStandardMaterial color={isBrewing ? "#ff4444" : "#44ff44"} />
            </mesh>

            {/* Cup */}
            <group
                ref={cupRef}
                position={[0.3, 0.2, 0]}
                visible={!cupHeld}
                onClick={pickupCup}
                onPointerOver={() => playSound('hover')}
            >
                <mesh>
                    <cylinderGeometry args={[0.08, 0.06, 0.15, 8]} />
                    <meshStandardMaterial color="#f5f5f5" />
                </mesh>

                {/* Liquid */}
                <mesh ref={liquidRef} position={[0, -0.05, 0]}>
                    <cylinderGeometry args={[0.07, 0.05, 0.1, 8]} />
                    <meshStandardMaterial color="#8B4513" transparent opacity={0.8} />
                </mesh>

                {/* Steam particles when brewing */}
                {isBrewing && (
                    <group position={[0, 0.1, 0]}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <mesh key={i} position={[Math.sin(i) * 0.02, i * 0.02, 0]}>
                                <sphereGeometry args={[0.005]} />
                                <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
                            </mesh>
                        ))}
                    </group>
                )}
            </group>

            {/* Held cup indicator */}
            {cupHeld && (
                <mesh
                    position={[0, 1.2, 0]}
                    onClick={sipCoffee}
                    onPointerOver={() => playSound('hover')}
                >
                    <cylinderGeometry args={[0.08, 0.06, 0.15, 8]} />
                    <meshStandardMaterial color="#f5f5f5" />
                    <mesh position={[0, -0.05, 0]}>
                        <cylinderGeometry args={[0.07, 0.05, 0.1, 8]} />
                        <meshStandardMaterial color="#8B4513" transparent opacity={0.8} />
                    </mesh>
                </mesh>
            )}
        </group>
    );
};