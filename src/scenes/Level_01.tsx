import { Water } from '../components/World/Water'
import { WorldBounds } from '../components/World/WorldBounds'
import { DecalSystem } from '../components/game/Environment/DecalSystem'
import { ConveyorBelt } from '../components/game/Environment/ConveyorBelt'
import { WindZone } from '../components/game/Environment/WindZone'
import { Magnet } from '../components/game/Environment/Magnet'
import { PhysicsSafety } from '../systems/PhysicsSafety'
import { PhysicsDoor } from '../components/game/PhysicsDoor'
import { BallisticProjectile } from '../components/game/BallisticProjectile'
import { PaperSheet } from '../components/game/PaperSheet'
import { OfficeChair } from '../components/game/OfficeChair'
import { PhysicsChain } from '../components/game/PhysicsChain'
import { InteractiveGrass } from '../components/game/InteractiveGrass'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Box, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store'
import { COLLISION_GROUPS } from '../utils/constants'
import { CameraSystem } from '../systems/CameraSystem'
import { GameLoop } from '../systems/GameLoop'
import GlobalAudio from '../components/audio/GlobalAudio'
import { CozyEnvironment } from '../components/World/CozyEnvironment'
import { NavigationManager } from '../systems/NavigationManager'
import { GridOverlay } from '../components/ui/GridOverlay'
import { Vehicle } from '../components/game/Vehicle'
import { SoftBody } from '../components/game/SoftBody'
import { MovingPlatform } from '../components/game/MovingPlatform'
import { PhysicsProp } from '../components/game/PhysicsProp'
import { Rope } from '../components/game/Rope'
import { Player } from '../components/game/Player'
import { Zones } from '../components/World/Zones'
import { TapGround } from '../components/game/TapGround'
import { Succulent } from '../components/game/Succulent'
import { ArtAssetsIntegration } from '../components/World/ArtAssetsIntegration'
import { PostProcessingEffects } from '../components/effects/PostProcessingEffects'
import { OfficePlant } from '../components/game/OfficePlant'

// ... (existing imports)

export default function Level_01() {
    // ... (existing refs)

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} near={0.05} />

            {/* CL-036: Physics Prop Intersect - Increase solver iterations/substeps */}
            {/* PH-001: Gravity -9.81, PH-050: Timestep 1/50 (0.02s) */}
            {/* PH-025: Joint Jitter - Increase solver iterations */}
            {/* SYS-048: Physics Pause */}
            <Physics
                gravity={[0, -9.81, 0]}
                debug={debugFlags.showPhysics}
                timeStep={1 / 50}
                paused={useGameStore((state) => state.isPaused)}
                maxSubSteps={5}
                numSolverIterations={8}
            >
                {/* PH-014: Static Environment Layers */}
                <RigidBody type="fixed" colliders="cuboid" collisionGroups={COLLISION_GROUPS.DEFAULT}>
                    <Box args={[100, 1, 100]} position={[0, -0.5, 0]} receiveShadow>
                        <meshStandardMaterial color="#f0f0f0" />
                    </Box>
                </RigidBody>

                {/* Example Wall */}
                <RigidBody type="fixed" colliders="cuboid" collisionGroups={COLLISION_GROUPS.DEFAULT} position={[0, 2.5, -10]}>
                    <Box args={[20, 5, 1]} receiveShadow>
                        <meshStandardMaterial color="#ddd" />
                    </Box>
                </RigidBody>

                {/* CL-040: Out of Bounds - Invisible Walls */}
                <WorldBounds />

                {/* CL-047: Glass Bullet Clip - Decal System */}
                <DecalSystem />


                {/* CL-037: Water Plane Clip */}
                <Water position={[0, -0.05, 0]} />

                <PerformanceMonitor />
                <CameraSystem />
                <GameLoop />
                <GlobalAudio />
                <CozyEnvironment />
                <NavigationManager debug={debugFlags.showNavMesh} />
                <GridOverlay />

                {/* PH-017: Vehicle Physics */}
                <Vehicle position={[10, 2, 5]} />

                {/* PH-022: Conveyor Physics */}
                <ConveyorBelt position={[5, 0.1, -5]} speed={3} direction={[1, 0, 0]} />

                {/* PH-026: Wind Influence */}
                <WindZone position={[0, 5, -10]} size={[10, 10, 10]} force={[2, 0, 5]} />

                {/* PH-029: Magnetism */}
                <Magnet position={[-5, 2, -5]} range={5} strength={100} />

                {/* PH-030: Nan/Inf Velocity Safety */}
                <PhysicsSafety />

                {/* PH-033: Soft Body */}
                <SoftBody position={[-8, 2, 0]} />

                {/* PH-034: Kinematic Platform */}
                <MovingPlatform startPos={[8, 0.5, 8]} endPos={[8, 4, 8]} />

                {/* PH-031: Slope Friction Test */}
                <RigidBody position={[-8, 1, 8]} rotation={[0.2, 0, 0]} type="fixed" friction={0.9}>
                    <Box args={[4, 0.2, 4]}>
                        <meshStandardMaterial color="#888" />
                    </Box>
                </RigidBody>
                <PhysicsProp id="friction_box" position={[-8, 2, 8]} type="box" materialType="rubber" />

                {/* PH-019: Rope Physics */}
                <Rope position={[-5, 8, 5]} length={8} />

                {/* CL-010: Clipping fixes audit - Player start pos */}
                <Player
                    ref={playerRef}
                    initialPosition={[0, 2, 0]}
                />
                {/* ... existing scene content ... */}
                <OfficePlant position={[3, 1, -7]} />
                <mesh position={[0, 3, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="blue" />
                </mesh>

                <RigidBody position={[2, 3, 0]} colliders={false}>
                    <CuboidCollider args={[0.5, 0.5, 0.5]} />
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                </RigidBody>

                <ambientLight intensity={1} color="white" />

                <RigidBody type="fixed" friction={2} restitution={0} position={[0, -0.5, 0]} colliders={false}>
                    <CuboidCollider args={[50, 0.5, 50]} />
                </RigidBody>

                <Zones />

                <Player ref={playerRef} initialPosition={[0, 2, 5]} />
                <TapGround playerRef={playerRef} />

                <PhysicsProp id="prop_box_1" position={[0, 1, 3]} type="box" />
                <PhysicsProp id="prop_ball_1" position={[1, 1, 3]} type="ball" />

                <Succulent id="artreq_026" position={[0.5, 1, 2.5]} />

                <ArtAssetsIntegration />

            </Physics>

            <PostProcessingEffects />
        </>
    )
}
