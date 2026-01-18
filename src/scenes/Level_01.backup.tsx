import React from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import Player, { PlayerHandle } from '../components/game/Player'
import { SoundBankProvider } from '../components/audio/SoundBank'
import { PhysicsProp } from '../components/game/Environment/PhysicsProp'
import { Succulent } from '../components/game/Environment/Succulent'
import TapGround from '../components/game/TapGround'
import gameSystemInstance from '../systems/GameSystem'
import GlobalAudio from '../components/audio/GlobalAudio'
import useGameStore from '../store'
import '../systems/InputManager'
import { PostProcessingEffects } from '../components/effects/PostProcessingEffects'
import { CozyEnvironment } from '../components/World/CozyEnvironment'
import CameraSystem from '../systems/CameraSystem'
import { Zones } from '../components/World/Zones'
import { NavigationManager } from '../components/game/NavigationManager'
import { CrowdManager } from '../components/game/AI/CrowdManager'
import { PatrolPath } from '../components/game/AI/PatrolPath'
import { GridOverlay } from '../components/ui/GridOverlay'
import PerformanceMonitor from '../systems/PerformanceMonitor'
import { ArtAssetsIntegration } from '../components/World/ArtAssetsIntegration'

// Game Loop Component
const GameLoop = () => {
    useFrame((state, delta) => {
        gameSystemInstance.update(state.clock.elapsedTime, delta)
    })
    return null
}

export default function Level_01() {
    const playerRef = React.useRef<PlayerHandle>(null)
    const debugFlags = useGameStore(state => state.debugFlags)
    const updatePatrolPath = useGameStore(state => state.updatePatrolPath)

    // Init Test Path
    React.useEffect(() => {
        updatePatrolPath('path_01', [
            [5, 0, 5],
            [15, 0, 5],
            [15, 0, 15],
            [5, 0, 15]
        ])
    }, [])

    return (
        <SoundBankProvider>
            <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} />

            {/* Cozy Office Environment Setup */}
            <Physics gravity={[0, -20, 0]} debug={debugFlags.showPhysics}>
                <PerformanceMonitor />
                <CameraSystem />
                <GameLoop />
                <GlobalAudio />
                <CozyEnvironment />
                <NavigationManager debug={debugFlags.showNavMesh} />
                <GridOverlay />
                <CrowdManager />
                <PatrolPath id="path_01" />

                {/* Ground Collision - Using Cuboid for robustness */}
                <RigidBody type="fixed" friction={2} restitution={0} position={[0, -1, 0]}>
                    <CuboidCollider args={[100, 1, 100]} />
                </RigidBody>

                <Zones />

                <Player ref={playerRef} initialPosition={[0, 2, 5]} />
                <TapGround playerRef={playerRef} />

                {/* Props */}
                <PhysicsProp id="prop_box_1" position={[0, 1, 3]} type="box" />
                <PhysicsProp id="prop_ball_1" position={[1, 1, 3]} type="ball" />
                <Succulent id="artreq_026" position={[0.5, 1, 2.5]} />

                {/* Integration of all 50 Art Assets */}
                <ArtAssetsIntegration />

            </Physics>

            {/* <PostProcessingEffects /> */}
        </SoundBankProvider>
    )
}
