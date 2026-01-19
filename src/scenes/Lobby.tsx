import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Html, SoftShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import InteractiveObject from '../components/game/InteractiveObject'

import Modal from '../components/ui/Modal'
import ProjectModal from '../components/ui/ProjectModal'
import BioModal from '../components/ui/BioModal'
import ContactForm from '../components/ui/ContactForm'
import KeyboardGuide from '../components/ui/KeyboardGuide'
import SkillInventory from '../components/ui/SkillInventory'
import GlobalHUD from '../components/ui/GlobalHUD'
import SmoothText from '../components/ui/SmoothText'
import PixelTransition from '../components/ui/PixelTransition'
import Player, { PlayerHandle } from '../components/game/Player'
import ClickMarker from '../components/game/ClickMarker'
import Grabber from '../components/game/Grabber'
import PhysicsInteractable from '../components/game/PhysicsInteractable'
import projectsData from '../assets/data/projects.json'
import bioData from '../assets/data/bio.json'

// Environment Components
import Walls from '../components/game/Environment/Walls'
import Floor from '../components/game/Environment/Floor'
import Decor from '../components/game/Environment/Decor'
import Background from '../components/game/Environment/Background'
import StrategyBoard from '../components/game/Environment/StrategyBoard'
import InspirationBoard from '../components/game/Environment/InspirationBoard'
import ReceptionDesk from '../components/game/Environment/ReceptionDesk'
import SupplyShelf from '../components/game/Environment/SupplyShelf'
import MailSlots from '../components/game/Environment/MailSlots'
import Effects from '../components/game/Effects'
import Motes from '../components/game/Environment/Motes'
import InspirationMote from '../components/game/Environment/InspirationMote'
import FlashOverlay from '../components/ui/FlashOverlay'
import UnlockEffect from '../components/ui/UnlockEffect'
import useAudioStore from '../audioStore'
import useCursorStore from '../stores/CursorStore'
import useGameStore from '../store' // SYS-040

import { useDeviceDetect } from '../hooks/useDeviceDetect'
// ...

// 1. Define interaction execution
const executeInteraction = () => {
    playerRef.current?.triggerInteraction(label)

    // SYS-040: NPC State Persistence
    useGameStore.getState().updateNpcState(closestObject || 'unknown', { hasTalked: true, dialogStage: 1 });

    playSound('teleport') // Sound effect for interaction
    setTimeout(() => {
        setFlashTrigger(true)
        setActiveModal(type)
        playSound('open_modal')
    }, 500) // Reduced delay for snappier feel
}

// 2. If target position exists, Queue MOVE -> INTERACT
if (targetPos) {
    const currentPos = playerPosition.current;
    const dist = currentPos.distanceTo(targetPos);

    if (dist > 3) {
        // Calculate walk target (slightly offset from object so we don't clip inside)
        const direction = new THREE.Vector3().subVectors(currentPos, targetPos).normalize();
        direction.y = 0;
        const walkTarget = targetPos.clone().add(direction.multiplyScalar(2.0));
        walkTarget.y = 0;

        // Queue Move
        playerRef.current.enqueueCommand({ type: 'MOVE', target: walkTarget })
        // Queue Interaction Callback
        playerRef.current.enqueueCommand({ type: 'CALLBACK', fn: executeInteraction })
    } else {
        // Already close enough, just interact
        executeInteraction()
    }
} else {
    // No target pos (e.g. keyboard command), just interact
    executeInteraction()
}
    }, [playSound, activeModal])

useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (activeModal) {
            if (e.key === 'Escape') {
                setActiveModal(null)
            }
            return
        }

        if (e.key === 'Enter' && closestObject) {
            const label = closestObject === 'projects' ? 'Projects' :
                closestObject === 'about' ? 'About Me' : 'Contact'
            handleInteraction(closestObject, label)
        }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
}, [closestObject, activeModal, handleInteraction])

const pulseRef = useRef<THREE.PointLight>(null)

const projectPos = useMemo(() => new THREE.Vector3(4, 0.5, -3), [])
const aboutPos = useMemo(() => new THREE.Vector3(-4, 0.5, -3), [])
const contactPos = useMemo(() => new THREE.Vector3(2, 0.5, -4.8), [])

useFrame(({ clock }, delta) => {
    if (pulseRef.current) {
        pulseRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 4) * 0.5
    }

    const pp = playerPosition.current
    // Camera logic removed (Handled by CameraController)

    const d1 = pp.distanceTo(projectPos)
    const d2 = pp.distanceTo(aboutPos)
    const d3 = pp.distanceTo(contactPos)

    const limit = 2.5
    let closest: 'projects' | 'about' | 'contact' | null = null
    let minDst = limit

    if (d1 < minDst) { minDst = d1; closest = 'projects' }
    if (d2 < minDst) { minDst = d2; closest = 'about' }
    if (d3 < minDst) { minDst = d3; closest = 'contact' }

    if (closest !== closestObject) {
        setClosestObject(closest)
    }
})

const floorTheme = useMemo(() => {
    switch (activeModal) {
        case 'projects': return 'project'
        case 'about': return 'about'
        case 'contact': return 'contact'
        default: return 'lobby'
    }
}, [activeModal])

const handleFloorClick = (point: THREE.Vector3) => {
    if (activeModal) return // Block movement if modal is open

    const target = point.clone()
    target.y = 0
    setClickTarget(target)
    setCursor('crosshair')
    setTimeout(() => setCursor('default'), 200)

    if (playerRef.current) {
        playerRef.current.moveTo(target)
    }
}

const motes = useMemo(() => [
    { id: 1, position: [-5, 1, 5], quote: "Design is not just what it looks like and feels like. Design is how it works." },
    { id: 2, position: [5, 2, 5], quote: "Code is poetry." },
    { id: 3, position: [0, 3, -7], quote: "Simplicity is the ultimate sophistication." },
    { id: 4, position: [6, 0.5, 0], quote: "Good software is like a joke. If you have to explain it, it’s bad." },
    { id: 5, position: [-6, 0.5, 2], quote: "First, solve the problem. Then, write the code." }
], []);

return (
    <group>
        <CameraController />
        <Background />

        {/* Clickable Plane for Movement */}
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            onClick={(e) => handleFloorClick(e.point)}
            onPointerOver={() => setCursor('crosshair')}
            onPointerOut={() => setCursor('default')}
        >
            <planeGeometry args={[12, 12]} />
            <meshBasicMaterial transparent opacity={0} castShadow={false} />
        </mesh>

        <Floor width={12} depth={12} theme={floorTheme} onFloorClick={handleFloorClick} />
        <Walls width={12} depth={12} height={4} playerPosition={playerPosition.current} />
        <Decor width={12} depth={12} />
        <Motes count={80} area={[15, 10, 15]} />

        {motes.map(mote => (
            <InspirationMote
                key={mote.id}
                id={mote.id}
                position={mote.position as [number, number, number]}
                quote={mote.quote}
            />
        ))}

        <Player
            ref={playerRef}
            onPositionChange={(pos) => playerPosition.current.copy(pos)}
            initialPosition={[0, 0.5, 0]}
            bounds={{ width: 12, depth: 12 }}
        />

        <Grabber />

        {/* TEST OBJECT: Physics Ball */}
        <PhysicsInteractable id="stress-ball" position={[0, 1, 2]} label="Stress Ball">
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.2]} />
                <meshStandardMaterial color="#FF4081" roughness={0.4} />
            </mesh>
        </PhysicsInteractable>

        <ClickMarker position={clickTarget} onComplete={() => setClickTarget(null)} />

        {/* LIGHTING & ATMOSPHERE */}
        <SoftShadows size={15} samples={16} focus={0.5} />

        <ambientLight intensity={0.3} color="#e6cba8" />

        <directionalLight
            position={[-8, 12, -8]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
            color="#ffcc80" // Warmer Sun
        />

        {/* Fill Light - Cool tone to contrast warm sun */}
        <directionalLight
            position={[8, 5, 8]}
            intensity={0.4}
            color="#b0bec5" // Cool Blue Gray
            castShadow={false}
        />

        <hemisphereLight args={['#d88c5a', '#4a3728', 0.2]} />

        <pointLight position={[0, 5, 0]} intensity={0.1} color="#d88c5a" distance={15} decay={2} />

        <pointLight position={[4, 2, -3]} intensity={0.2} color="#fcf4e8" distance={5} decay={2} />
        <pointLight position={[-4, 2, -3]} intensity={0.2} color="#fcf4e8" distance={5} decay={2} />

        <Effects />

        <StrategyBoard
            position={[4, 0, -3]}
            rotation={[0, -Math.PI / 2, 0]}
            onClick={() => handleInteraction('projects', 'Projects', projectPos)}
        />

        <pointLight ref={pulseRef} position={[4, 2, -3]} intensity={1.5} color="#FFD54F" distance={3} decay={2} />

        <InteractiveObject
            position={[4, 0.5, -3]}
            label="Projects"
            color="#e67e22" // Burnt Orange
            onClick={() => handleInteraction('projects', 'Projects', projectPos)}
            playerPosition={playerPosition.current}
            visibleMesh={false}
            isFocused={closestObject === 'projects'}
            castShadow={false}
        />

        <InspirationBoard
            position={[-4, 0, -3]}
            rotation={[0, Math.PI / 2, 0]}
            onClick={() => handleInteraction('about', 'About Me', aboutPos)}
        />

        <InteractiveObject
            position={[-4, 0.5, -3]}
            label="About Me"
            color="#d88c5a" // Terracotta
            onClick={() => handleInteraction('about', 'About Me', aboutPos)}
            playerPosition={playerPosition.current}
            visibleMesh={false}
            isFocused={closestObject === 'about'}
            castShadow={false}
        />

        <SupplyShelf position={[0, 0, -5.5]} rotation={[0, 0, 0]} />

        <MailSlots
            position={[2, 0, -4.8]}
            rotation={[0, 0, 0]}
            onClick={() => handleInteraction('contact', 'Contact', contactPos)}
        />

        <InteractiveObject
            position={[2, 0.5, -4.8]}
            label="Contact"
            color="#e67e22" // Burnt Orange
            onClick={() => handleInteraction('contact', 'Contact', contactPos)}
            playerPosition={playerPosition.current}
            visibleMesh={false}
            isFocused={closestObject === 'contact'}
            castShadow={false}
        />

        <ReceptionDesk
            position={[0, 0, -2]}
            rotation={[0, Math.PI, 0]}
            onClick={() => {
                handleInteraction('projects', 'Projects', projectPos)
            }}
        />



        {isMobile && closestObject && !activeModal && (
            <Html position={[0, -2, 0]} center style={{ pointerEvents: 'none', width: '100vw', height: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '100px' }}>
                <button
                    onClick={() => {
                        const label = closestObject === 'projects' ? 'Projects' :
                            closestObject === 'about' ? 'About Me' : 'Contact'
                        handleInteraction(closestObject, label)
                    }}
                    style={{
                        pointerEvents: 'all',
                        background: '#ffa726',
                        border: '4px solid white',
                        borderRadius: '12px',
                        padding: '16px 24px',
                        fontFamily: '"Press Start 2P", cursive',
                        fontSize: '16px',
                        color: '#333',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        animation: 'bounce 1s infinite'
                    }}
                >
                    INSPECT {closestObject.toUpperCase()}
                </button>
            </Html>
        )}

        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                <UnlockEffect />
                <FlashOverlay trigger={flashTrigger} onComplete={() => setFlashTrigger(false)} />
                {!isMobile && <KeyboardGuide />}

                <GlobalHUD
                    onNavigate={(section) => {
                        if (section) {
                            setActiveModal(section)
                        } else {
                            setActiveModal(null)
                        }
                    }}
                    activeSection={activeModal}
                />

                <SkillInventory skills={bioData.skills} />

                <ProjectModal
                    isOpen={activeModal === 'projects'}
                    onClose={() => setActiveModal(null)}
                    projects={projectsData}
                />

                <BioModal
                    isOpen={activeModal === 'about'}
                    onClose={() => setActiveModal(null)}
                    bio={bioData}
                />

                <Modal
                    title="Contact Me"
                    isOpen={activeModal === 'contact'}
                    onClose={() => setActiveModal(null)}
                >
                    <PixelTransition>
                        <p><SmoothText text="Send me a message and let's work together!" delay={0.2} /></p>
                        <ContactForm />

                        <div style={{ marginTop: '20px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
                            <a
                                href="./assets/resume.pdf"
                                download
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    background: '#e67e22', // Burnt Orange
                                    color: 'white',
                                    padding: '15px',
                                    textAlign: 'center',
                                    textDecoration: 'none',
                                    fontFamily: '"Press Start 2P", cursive',
                                    border: '4px solid #fcf4e8', // Warm Cream Border
                                    boxShadow: '0 4px 0 #bf360c', // Darker Orange Shadow
                                    marginBottom: '20px'
                                }}
                            >
                                💾 DOWNLOAD RESUME
                            </a>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '24px' }}>👔</a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '24px' }}>🐙</a>
                                <a href="https://behance.net" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontSize: '24px' }}>🎨</a>
                            </div>
                        </div>
                    </PixelTransition>
                </Modal>
            </div>
        </Html>
    </group>
)
}

const Lobby = () => {
    // ASSET GALLERY DEBUG
    const [showAssetGallery, setShowAssetGallery] = useState(false)

    useEffect(() => {
        const toggleGallery = (e: KeyboardEvent) => {
            if (e.key === 'g' && e.ctrlKey) {
                setShowAssetGallery(prev => !prev)
            }
        }
        window.addEventListener('keydown', toggleGallery)
        return () => window.removeEventListener('keydown', toggleGallery)
    }, [])

    return (
        <Physics gravity={[0, -9.81, 0]} timeStep={1 / 50}>
            {!showAssetGallery ? (
                <LobbyContent />
            ) : (
                <group>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <CameraController />
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>

                    <Text position={[0, 4, -5]} fontSize={1} color="white" anchorX="center">
                        ASSET REQUIREMENT EXECUTION GALLERY
                    </Text>

                    {ASSET_LIST.map((asset: any, index: number) => {
                        const row = Math.floor(index / 10)
                        const col = index % 10
                        return (
                            <AssetPlaceholder
                                key={asset.id}
                                id={asset.id}
                                position={[col * 2 - 9, 0, row * 2 - 5]}
                            />
                        )
                    })}
                </group>
            )}
            {/* FIXED: Use sunset for lighting, but disable background to use our Custom Background.tsx */}
        </Physics>
    )
}

export default Lobby
