import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky, Stars, Environment, KeyboardControls } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import Player from '../components/game/Player'
import { SoundBankProvider } from '../components/audio/SoundBank'
import GameSystem from '../systems/GameSystem'
import GlobalAudio from '../components/audio/GlobalAudio'
import Inputs from '../systems/InputManager'
import Door from './Interactive/Door'

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

                            {/* 1. LOBBY */}
                            <RigidBody type="fixed" friction={1}>
                                {/* Floor */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[20, 1, 20]} />
                                    <meshStandardMaterial color="#444" />
                                </mesh>
                                {/* Walls */}
                                <mesh position={[-10, 2, 0]} receiveShadow>
                                    <boxGeometry args={[1, 5, 20]} />
                                    <meshStandardMaterial color="#666" />
                                </mesh>
                                <mesh position={[10, 2, 0]} receiveShadow>
                                    <boxGeometry args={[1, 5, 20]} />
                                    <meshStandardMaterial color="#666" />
                                </mesh>
                                <mesh position={[0, 2, -10]} receiveShadow>
                                    <boxGeometry args={[20, 5, 1]} />
                                    <meshStandardMaterial color="#666" />
                                </mesh>
                                {/* Exit to Corridor (Gap in South Wall) */}
                                <mesh position={[-6, 2, 10]} receiveShadow>
                                    <boxGeometry args={[9, 5, 1]} />
                                    <meshStandardMaterial color="#666" />
                                </mesh>
                                <mesh position={[6, 2, 10]} receiveShadow>
                                    <boxGeometry args={[9, 5, 1]} />
                                    <meshStandardMaterial color="#666" />
                                </mesh>
                            </RigidBody>

                            {/* 2. CORRIDOR (Wall Run Test) */}
                            <RigidBody type="fixed" friction={1} position={[0, 0, 30]}>
                                {/* Floor */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[4, 1, 40]} />
                                    <meshStandardMaterial color="#333" />
                                </mesh>
                                {/* Wall Run Walls (High friction? Or use special Logic?) */}
                                <mesh position={[-2.5, 2.5, 0]}>
                                    <boxGeometry args={[1, 6, 40]} />
                                    <meshStandardMaterial color="#55aa55" />
                                </mesh>
                                <mesh position={[2.5, 2.5, 0]}>
                                    <boxGeometry args={[1, 6, 40]} />
                                    <meshStandardMaterial color="#55aa55" />
                                </mesh>
                            </RigidBody>

                            {/* 3. THE PIT (Dash Jump) */}
                            <RigidBody type="fixed" friction={1} position={[0, -5, 60]}>
                                {/* Landing Platform */}
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[10, 1, 10]} />
                                    <meshStandardMaterial color="#444" />
                                </mesh>
                            </RigidBody>
                            {/* Gap is between Corridor end (z=50) and Pit start (z=55) */}

                            {/* 4. PUZZLE ROOM */}
                            <RigidBody type="fixed" friction={1} position={[0, 0, 80]}>
                                <mesh position={[0, -0.5, 0]} receiveShadow>
                                    <boxGeometry args={[15, 1, 15]} />
                                    <meshStandardMaterial color="#555" />
                                </mesh>
                                <mesh position={[0, 2, 7.5]}>
                                    <boxGeometry args={[15, 5, 1]} />
                                    <meshStandardMaterial color="#777" />
                                </mesh>
                            </RigidBody>

                            {/* CONT-004: Door */}
                            <Door
                                id="door_puzzle"
                                position={[0, 0, 72.5]} // Entrance to Puzzle Room (approx) 
                                // Actually Level logic: Pit ends 65, Puzzle starts 80(center). 80-7.5=72.5 edge.
                                label="Puzzle Door"
                                isLocked={true}
                                keyId="key_01"
                            />

                            {/* --- PLAYER --- */}
                            <Player initialPosition={[0, 2, 0]} />

                        </Physics>
                    </Canvas>
                    <Inputs />
                </div>
            </SoundBankProvider>
        </KeyboardControls>
    )
}
