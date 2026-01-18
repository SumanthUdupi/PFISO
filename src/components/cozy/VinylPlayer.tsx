import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useAudioStore from "../../audioStore";

interface VinylPlayerProps {
    position: [number, number, number];
}

const GENRES = ['Lo-Fi', 'Jazz', 'Synthwave'];
const TRACKS = {
    'Lo-Fi': 'Chill beats',
    'Jazz': 'Smooth jazz',
    'Synthwave': 'Retro waves'
};

export const VinylPlayer: React.FC<VinylPlayerProps> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const recordRef = useRef<THREE.Mesh>(null);
    const needleRef = useRef<THREE.Mesh>(null);

    const [currentGenre, setCurrentGenre] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordPlaced, setRecordPlaced] = useState(false);
    const [needleDown, setNeedleDown] = useState(false);

    const { playSound } = useAudioStore();

    const flipRecord = () => {
        setCurrentGenre((prev) => (prev + 1) % GENRES.length);
        playSound('click');
    };

    const placeRecord = () => {
        if (recordPlaced) return;
        setRecordPlaced(true);
        playSound('click');
    };

    const dropNeedle = () => {
        if (!recordPlaced || needleDown) return;
        setNeedleDown(true);
        setIsPlaying(true);
        playSound('success');
    };

    const liftNeedle = () => {
        setNeedleDown(false);
        setIsPlaying(false);
        playSound('click');
    };

    useFrame((state, delta) => {
        // Rotate record when playing
        if (recordRef.current && isPlaying) {
            recordRef.current.rotation.y += delta * 2; // Slow rotation
        }

        // EQ bars animation (would need actual audio analysis)
        // For now, just visual bars
    });

    return (
        <group ref={groupRef} position={position}>
            {/* Turntable Base */}
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
                <meshStandardMaterial color="#2a2a2a" />
            </mesh>

            {/* Platter */}
            <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.05, 16]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* Record Stack */}
            <group position={[-0.8, 0.5, 0]}>
                {GENRES.map((genre, index) => (
                    <mesh
                        key={genre}
                        position={[0, index * 0.02, 0]}
                        visible={index === currentGenre && !recordPlaced}
                        onClick={flipRecord}
                        onPointerOver={() => playSound('hover')}
                    >
                        <cylinderGeometry args={[0.15, 0.15, 0.01, 16]} />
                        <meshStandardMaterial color={index === 0 ? "#8B4513" : index === 1 ? "#654321" : "#9370DB"} />
                    </mesh>
                ))}
            </group>

            {/* Placed Record */}
            <mesh
                ref={recordRef}
                position={[0, 0.38, 0]}
                visible={recordPlaced}
                onClick={liftNeedle}
                onPointerOver={() => playSound('hover')}
            >
                <cylinderGeometry args={[0.25, 0.25, 0.005, 32]} />
                <meshStandardMaterial
                    color={currentGenre === 0 ? "#8B4513" : currentGenre === 1 ? "#654321" : "#9370DB"}
                />
                {/* Label */}
                <mesh position={[0, 0.001, 0]}>
                    <circleGeometry args={[0.1, 16]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </mesh>

            {/* Tonearm */}
            <group position={[0.3, 0.6, 0]}>
                <mesh>
                    <boxGeometry args={[0.3, 0.02, 0.02]} />
                    <meshStandardMaterial color="#4a4a4a" />
                </mesh>
                {/* Needle */}
                <mesh
                    ref={needleRef}
                    position={[0.15, -0.05, 0]}
                    rotation={[0, 0, needleDown ? -0.2 : 0]}
                    onClick={needleDown ? liftNeedle : dropNeedle}
                    onPointerOver={() => playSound('hover')}
                >
                    <coneGeometry args={[0.01, 0.05, 4]} />
                    <meshStandardMaterial color="#ff0000" />
                </mesh>
            </group>

            {/* Amplifier */}
            <group position={[0, 0.8, -0.5]}>
                <mesh>
                    <boxGeometry args={[0.4, 0.3, 0.2]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* EQ Bars */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <mesh key={i} position={[-0.15 + i * 0.075, 0.1, 0.11]}>
                        <boxGeometry args={[0.02, isPlaying ? 0.1 + Math.sin(Date.now() * 0.01 + i) * 0.05 : 0.05, 0.01]} />
                        <meshStandardMaterial color={isPlaying ? "#00ff00" : "#333333"} />
                    </mesh>
                ))}
            </group>

            {/* Currently Playing Display */}
            {isPlaying && (
                <mesh position={[0, 1.2, 0]}>
                    <planeGeometry args={[1, 0.2]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.8} />
                    {/* Text would need a text component */}
                </mesh>
            )}
        </group>
    );
};