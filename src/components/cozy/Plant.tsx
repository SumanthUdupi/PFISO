import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useAudioStore from "../../audioStore";

interface PlantProps {
    position: [number, number, number];
}

export const Plant: React.FC<PlantProps> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const plantRef = useRef<THREE.Group>(null);
    const potRef = useRef<THREE.Mesh>(null);

    const [thirstLevel, setThirstLevel] = useState(0); // 0 = healthy, 1 = very thirsty
    const [isWatering, setIsWatering] = useState(false);
    const [wateringProgress, setWateringProgress] = useState(0);
    const [hearts, setHearts] = useState<THREE.Vector3[]>([]);

    const { playSound } = useAudioStore();

    // Simulate plant getting thirsty over time
    useEffect(() => {
        const interval = setInterval(() => {
            setThirstLevel(prev => Math.min(prev + 0.1, 1));
        }, 30000); // Get thirsty every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const startWatering = () => {
        if (isWatering) return;
        setIsWatering(true);
        setWateringProgress(0);
        playSound('click');
    };

    useFrame((state, delta) => {
        if (isWatering) {
            setWateringProgress(prev => {
                const newProgress = prev + delta * 2; // 0.5 seconds to water
                if (newProgress >= 1) {
                    setIsWatering(false);
                    setThirstLevel(0); // Fully watered
                    playSound('success');

                    // Spawn heart particles
                    const newHearts = Array.from({ length: 3 }, (_, i) => new THREE.Vector3(
                        position[0] + (Math.random() - 0.5) * 0.5,
                        position[1] + 1 + i * 0.2,
                        position[2] + (Math.random() - 0.5) * 0.5
                    ));
                    setHearts(newHearts);

                    // Remove hearts after animation
                    setTimeout(() => setHearts([]), 2000);

                    return 1;
                }
                return newProgress;
            });
        }

        // Update plant appearance based on thirst
        if (plantRef.current) {
            const droop = thirstLevel * 0.3;
            plantRef.current.rotation.z = droop;
            plantRef.current.scale.setScalar(1 - thirstLevel * 0.2);

            // Color desaturation
            plantRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    const saturation = 1 - thirstLevel * 0.5;
                    child.material.color.setHSL(0.3, saturation, 0.5);
                }
            });
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Pot */}
            <mesh ref={potRef} position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.15, 0.12, 0.2, 8]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Soil */}
            <mesh position={[0, 0.18, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.04, 8]} />
                <meshStandardMaterial color="#654321" />
            </mesh>

            {/* Plant */}
            <group ref={plantRef} position={[0, 0.25, 0]}>
                {/* Stem */}
                <mesh>
                    <cylinderGeometry args={[0.02, 0.03, 0.3, 6]} />
                    <meshStandardMaterial color="#228B22" />
                </mesh>

                {/* Leaves */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <mesh
                        key={i}
                        position={[
                            Math.cos((i / 4) * Math.PI * 2) * 0.1,
                            0.1 + (i % 2) * 0.1,
                            Math.sin((i / 4) * Math.PI * 2) * 0.1
                        ]}
                        rotation={[0, 0, (i / 4) * Math.PI * 2]}
                    >
                        <planeGeometry args={[0.15, 0.1]} />
                        <meshStandardMaterial color="#32CD32" side={THREE.DoubleSide} />
                    </mesh>
                ))}
            </group>

            {/* Watering Can (when watering) */}
            {isWatering && (
                <group position={[0.2, 0.5, 0]}>
                    <mesh>
                        <cylinderGeometry args={[0.05, 0.03, 0.15, 6]} />
                        <meshStandardMaterial color="#C0C0C0" />
                    </mesh>
                    {/* Water stream */}
                    <mesh position={[0, -0.1, 0]}>
                        <cylinderGeometry args={[0.01, 0.01, 0.2, 4]} />
                        <meshStandardMaterial color="#4169E1" transparent opacity={0.7} />
                    </mesh>
                </group>
            )}

            {/* Heart particles */}
            {hearts.map((heartPos, i) => (
                <mesh key={i} position={[heartPos.x - position[0], heartPos.y - position[1], heartPos.z - position[2]]}>
                    <sphereGeometry args={[0.02]} />
                    <meshBasicMaterial color="#FF69B4" />
                </mesh>
            ))}

            {/* Watering trigger area */}
            <mesh
                position={[0, 0.3, 0]}
                visible={false} // Invisible trigger
                onClick={startWatering}
                onPointerOver={() => playSound('hover')}
            >
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
        </group>
    );
};