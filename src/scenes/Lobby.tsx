import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Html, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import InteractiveObject from '../components/game/InteractiveObject'
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
import DeskGroup from '../components/game/Environment/DeskGroup'
import Effects from '../components/game/Effects'
import Motes from '../components/game/Environment/Motes'
import FlashOverlay from '../components/ui/FlashOverlay'
import IntroOverlay from '../components/ui/IntroOverlay'

import { useDeviceDetect } from '../hooks/useDeviceDetect'

const CameraController = () => {
    const { camera } = useThree()
    const { isMobile } = useDeviceDetect()

    useEffect(() => {
        // Requirement: 25-30% closer on mobile.
        // Desktop default is roughly zoom 40 (set in App.tsx).
        // Mobile default in App.tsx was 20.
        // If "closer" means objects look bigger, zoom should be HIGHER.
        // If "closer" means camera physical position is closer (in perspective), objects look bigger.
        // In Orthographic, zoom=40 means view size is W/40.
        // So higher zoom = smaller frustum = larger objects = "closer".

        // Let's interpret "25-30% closer" as "1.25x - 1.3x magnification compared to desktop".
        // Desktop zoom: 40.
        // Mobile zoom should be ~50-52?
        // But App.tsx logic was: <768px -> zoom 20. This might have been "zoomed out" to fit more?
        // I will override it here.

        if (isMobile) {
            camera.zoom = 50
        } else {
            camera.zoom = 40
        }
        camera.updateProjectionMatrix()
    }, [camera, isMobile])
    return null
}


const Lobby = () => {
  const { isMobile } = useDeviceDetect()
  const [introComplete, setIntroComplete] = useState(false)
  const [activeModal, setActiveModal] = useState<'projects' | 'about' | 'contact' | null>(null)
  const [flashTrigger, setFlashTrigger] = useState(false)
  const [closestObject, setClosestObject] = useState<'projects' | 'about' | 'contact' | null>(null)

  // Track player position for interactions
  const playerPosition = useRef(new THREE.Vector3(0, 0.5, 0))
  // Player ref for triggering animations
  const playerRef = useRef<PlayerHandle>(null)

  // Click Marker
  const [clickTarget, setClickTarget] = useState<THREE.Vector3 | null>(null)

  const handleInteraction = useCallback((type: 'projects' | 'about' | 'contact', label: string) => {
      if (playerRef.current) {
          playerRef.current.triggerInteraction(label)
          setTimeout(() => {
             setFlashTrigger(true)
             setActiveModal(type)
          }, 1500)
      } else {
          setFlashTrigger(true)
          setActiveModal(type)
      }
  }, [])

  // Keyboard Interaction Handler
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

  // Track closest object
  useFrame(({ clock }) => {
      if (pulseRef.current) {
          pulseRef.current.intensity = 1.5 + Math.sin(clock.elapsedTime * 4) * 0.5
      }

      const pp = playerPosition.current
      const projectPos = new THREE.Vector3(4, 0.5, -3)
      const aboutPos = new THREE.Vector3(-4, 0.5, -3)
      const contactPos = new THREE.Vector3(0, 0.5, -5)

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

  const handleFloorClick = (e: any) => {
      // e.point is the intersection point
      const target = e.point.clone()
      // Ensure target is on floor level roughly
      target.y = 0

      setClickTarget(target)
      if (playerRef.current) {
          playerRef.current.moveTo(target)
      }
  }

  return (
    <group>
        <CameraController />
        {!introComplete && (
            <IntroOverlay
                name={bioData.name}
                role={bioData.role}
                onComplete={() => setIntroComplete(true)}
            />
        )}
        <Background />

        {/* Clickable Plane for Movement (Invisible but catches raycasts) */}
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            onClick={handleFloorClick}
            // visible={false} prevents raycasting. We use transparent material with opacity 0 instead.
        >
             <planeGeometry args={[15, 15]} />
             <meshBasicMaterial transparent opacity={0} color="red" castShadow={false} />
        </mesh>

        {/* Environment */}
        <Floor width={15} depth={15} theme={floorTheme} />
        <Walls width={15} depth={15} height={4} playerPosition={playerPosition.current} />
        <Decor width={15} depth={15} />
        <Motes count={100} area={[20, 10, 20]} />

        <Player
            ref={playerRef}
            onPositionChange={(pos) => playerPosition.current.copy(pos)}
            initialPosition={[0, 0.5, 0]}
            bounds={{ width: 15, depth: 15 }}
        />

        <ClickMarker position={clickTarget} onComplete={() => setClickTarget(null)} />

        {/* Lights - Cozy Setup */}
        <ambientLight intensity={0.5} color="#4b3b60" />
        <directionalLight
            position={[-5, 10, -5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            color="#ff9966"
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffaa55" distance={15} decay={2} />

        <Effects />

        {/* Floating Text Instructions - Hide on Mobile */}
        {!isMobile && (
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 3, -2]}>
                <Text
                    fontSize={0.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#333"
                >
                    USE WASD TO MOVE | ENTER TO INTERACT
                </Text>
            </Float>
        )}

        {/* Project Desk Group */}
        <DeskGroup position={[4, 0, -3]} rotation={[0, -Math.PI/2, 0]} />

        {/* Featured Project Glow */}
        <pointLight ref={pulseRef} position={[4, 2, -3]} intensity={1.5} color="#00ff00" distance={3} decay={2} />

        <InteractiveObject
            position={[4, 0.5, -3]}
            label="Projects"
            color="#2ECC71"
            onClick={() => handleInteraction('projects', 'Projects')}
            playerPosition={playerPosition.current}
            visibleMesh={false}
            isFocused={closestObject === 'projects'}
            castShadow={false}
        />

        {/* About Bookshelf */}
        <InteractiveObject
            position={[-4, 0.5, -3]}
            label="About Me"
            color="#F39C12"
            onClick={() => handleInteraction('about', 'About Me')}
            playerPosition={playerPosition.current}
            isFocused={closestObject === 'about'}
            castShadow={false}
        />

        {/* Contact Computer */}
        <DeskGroup position={[0, 0, -5]} rotation={[0, 0, 0]} />
        <InteractiveObject
            position={[0, 0.5, -5]}
            label="Contact"
            color="#E74C3C"
            onClick={() => handleInteraction('contact', 'Contact')}
            playerPosition={playerPosition.current}
            visibleMesh={false}
            isFocused={closestObject === 'contact'}
            castShadow={false}
        />

        {/* Mobile Interaction Button Overlay */}
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
                        background: '#FFD700',
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
                                background: '#3498DB',
                                color: 'white',
                                padding: '15px',
                                textAlign: 'center',
                                textDecoration: 'none',
                                fontFamily: '"Press Start 2P", cursive',
                                border: '4px solid #2980B9',
                                boxShadow: '0 4px 0 #1A5276',
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

export default Lobby
