import { Water } from '../components/World/Water'
import { WorldBounds } from '../components/World/WorldBounds'
import { DecalSystem } from '../components/game/Environment/DecalSystem'
import { ConveyorBelt } from '../components/game/Environment/ConveyorBelt'
import { WindZone } from '../components/game/Environment/WindZone'
import { Magnet } from '../components/game/Environment/Magnet'
import { PhysicsSafety } from '../systems/PhysicsSafety'
import { ConferenceRoom } from '../components/game/Environment/ConferenceRoom'
import { ReceptionArea } from '../components/game/Environment/ReceptionArea'
import { BreakRoom } from '../components/game/Environment/BreakRoom'
import { CubicleCluster } from '../components/game/Environment/CubicleCluster'
import { PrivateOffice } from '../components/game/Environment/PrivateOffice'
import { HallwaySegment } from '../components/game/Environment/HallwaySegment'
import { UtilityArea } from '../components/game/Environment/UtilityArea'
import { Bathroom } from '../components/game/Environment/Bathroom'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Box, PerspectiveCamera, PerformanceMonitor } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store'
import { COLLISION_GROUPS } from '../systems/PhysicsLayers'
import { CameraSystem } from '../systems/CameraSystem'
import { GameLoop } from '../systems/GameLoop'
import GlobalAudio from '../components/audio/GlobalAudio'
import { CozyEnvironment } from '../components/World/CozyEnvironment'
import { NavigationManager } from '../components/game/NavigationManager'
import { GridOverlay } from '../components/ui/GridOverlay'
import { Vehicle } from '../components/game/Vehicle'
import { SoftBody } from '../components/game/SoftBody'
import { MovingPlatform } from '../components/game/MovingPlatform'
import { PhysicsProp } from '../components/game/Environment/PhysicsProp'
import { Rope } from '../components/game/Rope'
import Player from '../components/game/Player'
import { Zones } from '../components/World/Zones'
import TapGround from '../components/game/TapGround'
import { Succulent } from '../components/game/Environment/Succulent'
import { ArtAssetsIntegration } from '../components/World/ArtAssetsIntegration'
import { PostProcessingEffects } from '../components/effects/PostProcessingEffects'
import { OfficePlant } from '../components/game/Environment/OfficeAssets'
import AmbientZone from '../components/audio/AmbientZone'
import ReverbZone from '../components/audio/ReverbZone'
import WindSystem from '../components/audio/WindSystem'
import MusicSystem from '../components/audio/MusicSystem'
import { VisibilityZone } from '../components/game/Environment/VisibilityZone'
import { CompassUpdater } from '../components/ui/Compass'
import { ProjectileSystem } from '../systems/ProjectileSystem'
import { WaypointOverlay } from '../components/ui/WaypointOverlay'

export default function Level_01() {
    const playerRef = useRef(null)
    const debugFlags = useGameStore(state => state.debugFlags)

    return (
        <>
            {/* VIS-044: Near Clip - Adjust to prevent face clipping */}
            <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} near={0.01} />

            {/* CL-036: Physics Prop Intersect - Increase solver iterations/substeps */}
            {/* PH-001: Gravity -9.81, PH-050: Timestep 1/50 (0.02s) */}
            {/* PH-025: Joint Jitter - Increase solver iterations */}
            {/* SYS-048: Physics Pause */}
            <Physics
                gravity={[0, -9.81, 0]}
                debug={debugFlags.showPhysics}
                timeStep={1 / 60} // PERF-034: Standard 60Hz (Sub-step via maxSubSteps)
                paused={useGameStore((state) => state.isPaused)}
                maxSubSteps={4} // Reduced slightly as 60Hz is faster than 50Hz
                numSolverIterations={8}
            // PERF-031: Job System (Worker Thread)
            // Note: If this breaks interactions, revert "worker"
            // worker // Commented out for now as it requires careful testing of specific event handlers

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
                <ProjectileSystem />

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


                {/* ENV-001: Conference Room */}
                <VisibilityZone position={[-15, 0, 0]} range={25}>
                    <ConferenceRoom position={[-15, 0, 0]} rotation={[0, 0.5, 0]} />
                </VisibilityZone>


                {/* ENV-002: Reception Area */}
                <VisibilityZone position={[0, 5, 15]} range={25}>
                    <ReceptionArea position={[0, 0, 15]} />
                </VisibilityZone>

                {/* ENV-004: Break Room */}
                <VisibilityZone position={[15, 0, 0]} range={25}>
                    <BreakRoom position={[15, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
                </VisibilityZone>

                {/* ENV-003, ENV-008: Open Office Area */}
                <VisibilityZone position={[0, 0, -10]} range={30}>
                    <CubicleCluster position={[0, 0, -10]} />

                    <CubicleCluster position={[8, 0, -10]} />
                    <CubicleCluster position={[-8, 0, -10]} />
                </VisibilityZone>

                {/* ENV-007: Private Office */}
                <VisibilityZone position={[-10, 0, 10]} range={15}>
                    <PrivateOffice position={[-10, 0, 10]} />
                </VisibilityZone>

                <VisibilityZone position={[10, 0, 10]} range={15}>
                    <PrivateOffice position={[10, 0, 10]} rotation={[0, Math.PI, 0]} />
                </VisibilityZone>

                {/* ENV-006: Hallways */}
                {/* Main Spine (Z-Axis) connecting Reception to Cubicles */}
                <HallwaySegment position={[0, 0, 5]} length={10} width={4} />

                {/* Cross Hallway (X-Axis) connecting BreakRoom and Conference */}
                <HallwaySegment position={[5, 0, 0]} length={10} width={4} rotation={[0, Math.PI / 2, 0]} />
                <HallwaySegment position={[-5, 0, 0]} length={10} width={4} rotation={[0, Math.PI / 2, 0]} />


                {/* ENV-050, ENV-028: Utility Area */}
                <VisibilityZone position={[5, 0, 10]} range={15}>
                    <UtilityArea position={[5, 0, 10]} />
                </VisibilityZone>

                {/* ENV-Bathroom */}
                <VisibilityZone position={[-5, 0, 10]} range={15}>
                    <Bathroom position={[-5, 0, 10]} />
                </VisibilityZone>






            </Physics>

            {/* AUD-002: Ambient Audio Zones */}
            <AmbientZone position={[5, 4, 10]} type="ambient_hvac" volume={0.4} distance={20} />
            <AmbientZone position={[0, 1, -10]} type="ambient_computer" volume={0.2} distance={10} />
            <AmbientZone position={[8, 1, -10]} type="ambient_computer" volume={0.2} distance={10} />
            <AmbientZone position={[-8, 1, -10]} type="ambient_computer" volume={0.2} distance={10} />
            <AmbientZone position={[0, 5, 0]} type="ambient_office" volume={0.3} distance={50} />

            {/* AUD-004: Hallway Reverb Zones */}
            <ReverbZone position={[0, 2, 5]} size={[4, 5, 10]} />
            <ReverbZone position={[0, 2, 0]} size={[20, 5, 4]} />

            {/* AUD-007: Wind System */}
            <WindSystem />

            {/* AUD-009: Dynamic Music */}
            <MusicSystem />

            {/* UX-019: Compass Updater */}
            <CompassUpdater />
            <WaypointOverlay />

            <PostProcessingEffects />
        </>
    )
}
