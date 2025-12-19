import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Html, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import InteractiveObject from '../components/game/InteractiveObject'
import Modal from '../components/ui/Modal'
import ContactForm from '../components/ui/ContactForm'
import KeyboardGuide from '../components/ui/KeyboardGuide'
import SkillInventory from '../components/ui/SkillInventory'
import Typewriter from '../components/ui/Typewriter'
import PixelTransition from '../components/ui/PixelTransition'
import ClickMarker from '../components/game/ClickMarker'
import Player, { PlayerHandle } from '../components/game/Player'
import projectsData from '../assets/data/projects.json'
import bioData from '../assets/data/bio.json'

// Environment Components
import Walls from '../components/game/Environment/Walls'
import Floor from '../components/game/Environment/Floor'
import Decor from '../components/game/Environment/Decor'
import Background from '../components/game/Environment/Background'
import Vignette from '../components/game/Environment/Vignette'
import DeskGroup from '../components/game/Environment/DeskGroup'

const Lobby = () => {
  const [activeModal, setActiveModal] = useState<'projects' | 'about' | 'contact' | null>(null)
  const [clickMarkers, setClickMarkers] = useState<{ id: number, position: THREE.Vector3 }[]>([])

  // Track player position for interactions
  const playerPosition = useRef(new THREE.Vector3(0, 0.5, 0))
  // Player ref for triggering animations
  const playerRef = useRef<PlayerHandle>(null)

  const handleFloorClick = (point: THREE.Vector3) => {
      const id = Date.now()
      setClickMarkers(prev => [...prev, { id, position: point }])
  }

  const removeMarker = (id: number) => {
      setClickMarkers(prev => prev.filter(m => m.id !== id))
  }

  const handleInteraction = (type: 'projects' | 'about' | 'contact', label: string) => {
      if (playerRef.current) {
          playerRef.current.triggerInteraction(label)
          setTimeout(() => {
             setActiveModal(type)
          }, 1500)
      } else {
          setActiveModal(type)
      }
  }

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
        <Floor width={15} depth={15} onFloorClick={handleFloorClick} theme={floorTheme} />
        <Walls width={15} depth={15} height={4} playerPosition={playerPosition.current} />
        <Decor width={15} depth={15} />
        <Vignette />

        {clickMarkers.map(marker => (
            <ClickMarker key={marker.id} position={marker.position} onComplete={() => removeMarker(marker.id)} />
        ))}

        <Player
            ref={playerRef}
            onPositionChange={(pos) => playerPosition.current.copy(pos)}
            initialPosition={[0, 0.5, 0]}
        />

        {/* Lights */}
        <ambientLight intensity={0.7} color="#ccccff" />
        <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
        >
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
        </directionalLight>

        {/* Floating Text Instructions */}
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={[0, 3, -2]}>
             <Text
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000"
            >
                EXPLORE THE OFFICE
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
        />

        {/* About Bookshelf */}
        <InteractiveObject
            position={[-4, 0.5, -3]}
            label="About Me"
            color="#F39C12"
            onClick={() => handleInteraction('about', 'About Me')}
            playerPosition={playerPosition.current}
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
        />

        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
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
