import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Html, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import InteractiveObject from '../components/game/InteractiveObject'
import Modal from '../components/ui/Modal'
import ContactForm from '../components/ui/ContactForm'
import KeyboardGuide from '../components/ui/KeyboardGuide'
import SkillInventory from '../components/ui/SkillInventory'
import Typewriter from '../components/ui/Typewriter'
import PixelTransition from '../components/ui/PixelTransition'
import Player, { PlayerHandle } from '../components/game/Player'
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

const Lobby = () => {
  const [activeModal, setActiveModal] = useState<'projects' | 'about' | 'contact' | null>(null)
  const [flashTrigger, setFlashTrigger] = useState(false)
  const [closestObject, setClosestObject] = useState<'projects' | 'about' | 'contact' | null>(null)

  // Track player position for interactions
  const playerPosition = useRef(new THREE.Vector3(0, 0.5, 0))
  // Player ref for triggering animations
  const playerRef = useRef<PlayerHandle>(null)

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

  // Track closest object
  useFrame(() => {
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

  return (
    <group>
        <Background />

        {/* Environment */}
        {/* Removed onFloorClick to disable click-to-move */}
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

        {/* Floating Text Instructions */}
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

        {/* Project Desk Group */}
        <DeskGroup position={[4, 0, -3]} rotation={[0, -Math.PI/2, 0]} />
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

        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                <FlashOverlay trigger={flashTrigger} onComplete={() => setFlashTrigger(false)} />
                <KeyboardGuide />
                <SkillInventory skills={bioData.skills} />
                <Modal
                    title="My Projects"
                    isOpen={activeModal === 'projects'}
                    onClose={() => setActiveModal(null)}
                >
                    <PixelTransition>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {projectsData.map((project) => (
                            <div key={project.id} style={{ border: '2px solid #ccc', padding: '10px', background: 'white' }}>
                                <h3 style={{marginTop: 0}}>{project.title}</h3>
                                <p><Typewriter text={project.description} speed={10} /></p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {project.techStack.map(tech => (
                                        <span key={tech} style={{ background: '#eee', padding: '2px 5px', fontSize: '0.8em', border: '1px solid #aaa' }}>{tech}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    </PixelTransition>
                </Modal>

                <Modal
                    title="About Me"
                    isOpen={activeModal === 'about'}
                    onClose={() => setActiveModal(null)}
                >
                    <PixelTransition>
                    <p><Typewriter text={bioData.summary} speed={15} /></p>
                    <h3>Experience</h3>
                    {bioData.experience.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '10px', padding: '10px', background: '#ecf0f1' }}>
                            <strong>{exp.role}</strong> at {exp.company} ({exp.years})
                        </div>
                    ))}
                    </PixelTransition>
                </Modal>

                <Modal
                    title="Contact Me"
                    isOpen={activeModal === 'contact'}
                    onClose={() => setActiveModal(null)}
                >
                    <PixelTransition>
                    <p><Typewriter text="Send me a message and let's work together!" speed={30} /></p>
                    <ContactForm />
                    </PixelTransition>
                </Modal>
            </div>
        </Html>
    </group>
  )
}

export default Lobby
