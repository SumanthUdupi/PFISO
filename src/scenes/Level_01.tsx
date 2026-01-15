import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Stars, Environment, KeyboardControls, Sparkles } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import Player from '../components/game/Player'
import { SoundBankProvider } from '../components/audio/SoundBank'
import GameSystem from '../systems/GameSystem'
import GlobalAudio from '../components/audio/GlobalAudio'
import Inputs from '../systems/InputManager'
import Door from './Interactive/Door'
import Pickup from './Interactive/Pickup'
import Prop from './Interactive/Prop'
import GoalTrigger from '../components/game/GoalTrigger'
import VoidTrigger from '../components/game/VoidTrigger'
import { PostProcessingEffects } from '../components/effects/PostProcessingEffects'

// Map controls
const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
    { name: 'action', keys: ['e', 'E', 'Enter'] },
    { name: 'menu', keys: ['Escape'] },
]

export default function Level_01() {
    return (
        <KeyboardControls map={keyboardMap}>
            <SoundBankProvider>
                <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
                    <Canvas shadows camera={{ fov: 75, position: [0, 5, 10] }}>
                        {/* Lighting & Environment */}
                        <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
                        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <ambientLight intensity={0.3} />
                        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
                        <Environment preset="night" background={false} />

                        <Physics gravity={[0, -20, 0]}>
                            <GameSystem />
                            <GlobalAudio />

                            {/* --- LEVEL GEOMETRY (Greybox) --- */}

                            {/* 1. LOBBY - Clean Sci-Fi */}
                            <RigidBody type="fixed" friction={1}>
                                {/* Reflective Floor */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[20, 1, 20]} />
                                    <meshStandardMaterial
                                        color="#1a1a1a"
                                        roughness={0.1}
                                        metalness={0.8}
                                    />
                                </mesh>
                                {/* Walls - White Panels */}
                                <mesh position={[-10, 2, 0]} receiveShadow>
                                    <boxGeometry args={[1, 5, 20]} />
                                    <meshStandardMaterial color="#eeeeee" roughness={0.2} metalness={0.1} />
                                </mesh>
                                <mesh position={[10, 2, 0]} receiveShadow>
                                    <boxGeometry args={[1, 5, 20]} />
                                    <meshStandardMaterial color="#eeeeee" roughness={0.2} metalness={0.1} />
                                </mesh>
                                <mesh position={[0, 2, -10]} receiveShadow>
                                    <boxGeometry args={[20, 5, 1]} />
                                    <meshStandardMaterial color="#eeeeee" roughness={0.2} metalness={0.1} />
                                </mesh>
                                {/* Exit to Corridor (Gap in South Wall) */}
                                <mesh position={[-6, 2, 10]} receiveShadow>
                                    <boxGeometry args={[9, 5, 1]} />
                                    <meshStandardMaterial color="#eeeeee" roughness={0.2} metalness={0.1} />
                                </mesh>
                                <mesh position={[6, 2, 10]} receiveShadow>
                                    <boxGeometry args={[9, 5, 1]} />
                                    <meshStandardMaterial color="#eeeeee" roughness={0.2} metalness={0.1} />
                                </mesh>
                            </RigidBody>
                            {/* Lobby Props */}
                            <Prop type="bench" position={[-8, 0, -8]} rotation={[0, Math.PI / 4, 0]} />
                            <Prop type="bench" position={[8, 0, -8]} rotation={[0, -Math.PI / 4, 0]} />
                            <Prop type="pillar" position={[-5, 2, 5]} />
                            <Prop type="pillar" position={[5, 2, 5]} />

                            {/* 2. CORRIDOR - Industrial Dark */}
                            <RigidBody type="fixed" friction={1} position={[0, 0, 30]}>
                                {/* Floor - Grate-like (Dark Metal) */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[4, 1, 40]} />
                                    <meshStandardMaterial color="#050505" roughness={0.7} metalness={0.8} />
                                </mesh>
                                {/* Walls - Green Industrial */}
                                <mesh position={[-2.5, 2.5, 0]}>
                                    <boxGeometry args={[1, 6, 40]} />
                                    <meshStandardMaterial color="#2a4a2a" roughness={0.8} metalness={0.4} />
                                </mesh>
                                <mesh position={[2.5, 2.5, 0]}>
                                    <boxGeometry args={[1, 6, 40]} />
                                    <meshStandardMaterial color="#2a4a2a" roughness={0.8} metalness={0.4} />
                                </mesh>
                                {/* Overhead Lights (Visual only, actual lights added below) */}
                                <mesh position={[0, 5, 0]}>
                                    <boxGeometry args={[3, 0.2, 5]} />
                                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
                                </mesh>
                            </RigidBody>
                            {/* Corridor Obstacles */}
                            <Prop type="crate" position={[-1, 0.5, 25]} />
                            <Prop type="crate" position={[1, 0.5, 35]} rotation={[0, 0.5, 0]} />
                            <Prop type="crate" position={[1.2, 1.5, 35]} rotation={[0, 0.2, 0]} />
                            <pointLight position={[0, 4, 30]} intensity={0.8} distance={15} color="#aaffaa" />
                            <pointLight position={[0, 4, 15]} intensity={0.5} distance={10} color="#aaffaa" />
                            <pointLight position={[0, 4, 45]} intensity={0.5} distance={10} color="#aaffaa" />

                            {/* 3. THE PIT - Hazard Zone */}
                            <RigidBody type="fixed" friction={1} position={[0, -5, 60]}>
                                {/* Landing Platform */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[10, 1, 10]} />
                                    <meshStandardMaterial color="#333" />
                                </mesh>
                                {/* Hazard Stripes (Simulated with simple geo for now) */}
                                <mesh position={[0, 0.01, 4]}>
                                    <boxGeometry args={[10, 0.05, 0.5]} />
                                    <meshStandardMaterial color="yellow" emissive="orange" emissiveIntensity={0.5} />
                                </mesh>
                                <mesh position={[0, 0.01, -4]}>
                                    <boxGeometry args={[10, 0.05, 0.5]} />
                                    <meshStandardMaterial color="yellow" emissive="orange" emissiveIntensity={0.5} />
                                </mesh>
                            </RigidBody>
                            {/* Pit Light */}
                            <spotLight position={[0, 5, 60]} angle={0.5} penumbra={0.5} intensity={2} color="orange" castShadow />
                            {/* Pit Debris */}
                            <Prop type="barrel" position={[-3, -4.5, 62]} />
                            <Prop type="barrel" position={[4, -4.5, 58]} rotation={[Math.PI / 2, 0, 0.5]} />

                            {/* CONT-005: Pickup (Key) */}
                            <Pickup
                                id="key_01"
                                position={[0, -3, 60]} // In the middle of the pit platform
                                type="key"
                                label="Puzzle Key"
                            />
                            {/* Gap is between Corridor end (z=50) and Pit start (z=55) */}

                            {/* 4. PUZZLE ROOM - Mystery */}
                            <RigidBody type="fixed" friction={1} position={[0, 0, 80]}>
                                {/* Floor */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[15, 1, 15]} />
                                    <meshStandardMaterial color="#111" roughness={0.5} metalness={0.5} />
                                </mesh>
                                {/* Back Wall */}
                                <mesh position={[0, 2, 7.5]}>
                                    <boxGeometry args={[15, 5, 1]} />
                                    <meshStandardMaterial color="#222" />
                                </mesh>
                                {/* Glowing Pillar */}
                                <mesh position={[0, 2, 0]}>
                                    <cylinderGeometry args={[1, 1, 4, 32]} />
                                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
                                </mesh>
                            </RigidBody>
                            <pointLight position={[0, 3, 80]} intensity={1.5} distance={20} color="#00ffff" />
                            <Sparkles count={50} scale={12} size={6} speed={0.4} opacity={0.5} position={[0, 2, 80]} color="#00ffff" />

                            {/* CONT-004: Door */}
                            <Door
                                id="door_puzzle"
                                position={[0, 0, 72.5]} // Entrance to Puzzle Room
                                label="Puzzle Door"
                                isLocked={true}
                                keyId="key_01"
                            />

                            {/* CONT-006: Goal Trigger (End of Level) */}
                            <GoalTrigger position={[0, 2, 85]} size={[4, 4, 4]} />
                            <VoidTrigger position={[0, -20, 0]} />

                            {/* --- PLAYER --- */}
                            <Player initialPosition={[0, 2, 0]} />

                        </Physics>

                        <PostProcessingEffects />
                    </Canvas>
                    <Inputs />
                </div>
            </SoundBankProvider>
        </KeyboardControls>
    )
}
