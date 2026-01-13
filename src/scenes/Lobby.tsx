import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Html, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import InteractiveObject from '../components/game/InteractiveObject'
import NPC from '../components/game/AI/NPC'
import Modal from '../components/ui/Modal'
import ProjectModal from '../components/ui/ProjectModal'
import BioModal from '../components/ui/BioModal'
import ContactForm from '../components/ui/ContactForm'
import KeyboardGuide from '../components/ui/KeyboardGuide'
import SkillInventory from '../components/ui/SkillInventory'
import GlobalHUD from '../components/ui/GlobalHUD'
import Typewriter from '../components/ui/Typewriter'
import PixelTransition from '../components/ui/PixelTransition'
import Player, { PlayerHandle } from '../components/game/Player'
import ClickMarker from '../components/game/ClickMarker'
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

import { useDeviceDetect } from '../hooks/useDeviceDetect'

const CameraController = () => {
    const { camera } = useThree()
    const { isMobile } = useDeviceDetect()

    useEffect(() => {
        if (isMobile) {
            camera.zoom = 55
        } else {
            camera.zoom = 40
        }
        camera.updateProjectionMatrix()
    }, [camera, isMobile])
    return null
}

const LobbyContent = () => {
    const { isMobile } = useDeviceDetect()
    const [introComplete, setIntroComplete] = useState(true)
    const [activeModal, setActiveModal] = useState<'projects' | 'about' | 'contact' | null>(null)
    const [flashTrigger, setFlashTrigger] = useState(false)
    const [closestObject, setClosestObject] = useState<'projects' | 'about' | 'contact' | null>(null)
    const { playSound, startAmbient, stopAmbient } = useAudioStore()
    const { setCursor } = useCursorStore()

    useEffect(() => {
        if (introComplete) {
            startAmbient();
        }
        return () => {
            stopAmbient();
        }
    }, [introComplete, startAmbient, stopAmbient]);

    const playerPosition = useRef(new THREE.Vector3(0, 0.5, 0))
    const playerRef = useRef<PlayerHandle>(null)
    const [clickTarget, setClickTarget] = useState<THREE.Vector3 | null>(null)

    const handleInteraction = useCallback((type: 'projects' | 'about' | 'contact', label: string, targetPos?: THREE.Vector3) => {
        const executeInteraction = () => {
            if (playerRef.current) {
                playerRef.current.triggerInteraction(label)
                playSound('teleport')
                setTimeout(() => {
                    setFlashTrigger(true)
                    setActiveModal(type)
                    playSound('open_modal')
                }, 1500)
            } else {
                setFlashTrigger(true)
                setActiveModal(type)
                playSound('open_modal')
            }
        }

        if (targetPos && playerRef.current) {
            const currentPos = playerPosition.current;
            const dist = currentPos.distanceTo(targetPos);
            if (dist > 3) {
                const direction = new THREE.Vector3().subVectors(currentPos, targetPos).normalize();
                direction.y = 0;
                const walkTarget = targetPos.clone().add(direction.multiplyScalar(2.0));
                walkTarget.y = 0;

                playerRef.current.moveTo(walkTarget, () => {
                    executeInteraction();
                });
            } else {
                executeInteraction();
            }
        } else {
            executeInteraction();
        }
    }, [])

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

    useFrame(({ clock, camera }, delta) => {
        if (pulseRef.current) {
            pulseRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 4) * 0.5
        }

        const pp = playerPosition.current
        const offset = new THREE.Vector3(0, 10, 10)
        const targetCamPos = pp.clone().add(offset)
        const damp = 1.0 - Math.exp(-3 * delta)

        camera.position.lerp(targetCamPos, damp)
        camera.lookAt(pp)

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
                <planeGeometry args={[15, 15]} />
                <meshBasicMaterial transparent opacity={0} castShadow={false} />
            </mesh>

            <Floor width={15} depth={15} theme={floorTheme} onFloorClick={handleFloorClick} />
            <Walls width={15} depth={15} height={4} playerPosition={playerPosition.current} />
            <Decor width={15} depth={15} />
            <Motes count={100} area={[20, 10, 20]} />

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
                bounds={{ width: 15, depth: 15 }}
            />

            <ClickMarker position={clickTarget} onComplete={() => setClickTarget(null)} />

            <ambientLight intensity={0.6} color="#4b3b60" />
            <directionalLight
                position={[-5, 10, -5]}
                intensity={0.8}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
                color="#ff9966"
            />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffaa55" distance={15} decay={2} />

            <pointLight position={[4, 2, -3]} intensity={0.8} color="#26a69a" distance={5} decay={2} />
            <pointLight position={[-4, 2, -3]} intensity={0.8} color="#ffa726" distance={5} decay={2} />

            <Effects />

            {!isMobile && (
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 3, -2]}>
                    <Text
                        fontSize={0.4}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#4b3b60"
                    >
                        USE WASD TO MOVE | ENTER TO INTERACT
                    </Text>
                </Float>
            )}

            <StrategyBoard
                position={[4, 0, -3]}
                rotation={[0, -Math.PI / 2, 0]}
                onClick={() => handleInteraction('projects', 'Projects', projectPos)}
            />

            <pointLight ref={pulseRef} position={[4, 2, -3]} intensity={1.5} color="#26a69a" distance={3} decay={2} />

            <InteractiveObject
                position={[4, 0.5, -3]}
                label="Projects"
                color="#26a69a"
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
                color="#ffa726"
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
                color="#ef5350"
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

            <NPC
                position={[0, 0, -1]}
                name="Receptionist"
                playerRef={playerRef}
            />

            <NPC
                position={[-5, 0, 5]}
                name="Visitor"
                playerRef={playerRef}
                waypoints={[
                    [-5, 0, 5],
                    [5, 0, 5],
                    [5, 0, 0],
                    [-5, 0, 0]
                ]}
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
                            <p><Typewriter text="Send me a message and let's work together!" speed={30} /></p>
                            <ContactForm />

                            <div style={{ marginTop: '20px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
                                <a
                                    href="./assets/resume.pdf"
                                    download
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        background: '#26a69a',
                                        color: 'white',
                                        padding: '15px',
                                        textAlign: 'center',
                                        textDecoration: 'none',
                                        fontFamily: '"Press Start 2P", cursive',
                                        border: '4px solid #1abc9c',
                                        boxShadow: '0 4px 0 #16a085',
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
    return (
        <Physics gravity={[0, -30, 0]} timeStep={1/60}>
            <LobbyContent />
        </Physics>
    )
}

export default Lobby
