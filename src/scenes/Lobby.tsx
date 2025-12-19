import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
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
import projectsData from '../assets/data/projects.json'
import bioData from '../assets/data/bio.json'

// Enhanced Floor with Checkerboard Pattern
const Floor = ({ onFloorClick }: { onFloorClick: (point: THREE.Vector3) => void }) => {
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.95, 0.95), [])
  const material1 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2C3E50', roughness: 0.8 }), [])
  const material2 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#34495E', roughness: 0.8 }), [])

  return (
    <group position={[0, -0.5, 0]}>
      {Array.from({ length: 15 }).map((_, x) =>
        Array.from({ length: 15 }).map((_, z) => (
          <mesh
            key={`${x}-${z}`}
            position={[x - 7, 0, z - 7]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            geometry={geometry}
            material={(x + z) % 2 === 0 ? material1 : material2}
            onClick={(e) => {
                e.stopPropagation()
                onFloorClick(e.point)
            }}
          />
        ))
      )}
      {/* Decorative border */}
       <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
       </mesh>
    </group>
  )
}

const Player = () => {
  const mesh = useRef<THREE.Group>(null)

  // Use refs for state to avoid re-renders
  const position = useRef(new THREE.Vector3(0, 0.5, 0))
  const facing = useRef(0)
  const keys = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true }
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (mesh.current) {
        // Movement Logic
        const speed = 5 * delta
        let moved = false

        if (keys.current['w'] || keys.current['ArrowUp']) {
             position.current.z -= speed
             facing.current = Math.PI
             moved = true
        }
        if (keys.current['s'] || keys.current['ArrowDown']) {
             position.current.z += speed
             facing.current = 0
             moved = true
        }
        if (keys.current['a'] || keys.current['ArrowLeft']) {
             position.current.x -= speed
             facing.current = -Math.PI / 2
             moved = true
        }
        if (keys.current['d'] || keys.current['ArrowRight']) {
             position.current.x += speed
             facing.current = Math.PI / 2
             moved = true
        }

        // Apply smooth visuals
        // Bobbing
        mesh.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * (moved ? 10 : 2)) * 0.1

        // Smooth rotation
        // We use a simple lerp for rotation, handling the PI/-PI wrap could be better but sufficient for isometric
        mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, facing.current, 0.1)

        // Lerp position for smoothness (or direct assignment)
        mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, position.current.x, 0.2)
        mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, position.current.z, 0.2)
    }
  })

  return (
    <group ref={mesh} position={[0, 0.5, 0]}>
      {/* Body */}
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.3]} />
        <meshStandardMaterial color="#E74C3C" />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#F1C40F" />
      </mesh>
      {/* Shadow Blob */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

const Lobby = () => {
  const [activeModal, setActiveModal] = useState<'projects' | 'about' | 'contact' | null>(null)
  const [clickMarkers, setClickMarkers] = useState<{ id: number, position: THREE.Vector3 }[]>([])

  const handleFloorClick = (point: THREE.Vector3) => {
      const id = Date.now()
      setClickMarkers(prev => [...prev, { id, position: point }])
  }

  const removeMarker = (id: number) => {
      setClickMarkers(prev => prev.filter(m => m.id !== id))
  }

  return (
    <group>
        <Floor onFloorClick={handleFloorClick} />
        {clickMarkers.map(marker => (
            <ClickMarker key={marker.id} position={marker.position} onComplete={() => removeMarker(marker.id)} />
        ))}

        <Player />

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

        {/* Project Desk */}
        <InteractiveObject
            position={[4, 0.5, -3]}
            label="Projects"
            color="#2ECC71"
            onClick={() => setActiveModal('projects')}
        />

        {/* About Bookshelf */}
        <InteractiveObject
            position={[-4, 0.5, -3]}
            label="About Me"
            color="#F39C12"
            onClick={() => setActiveModal('about')}
        />

        {/* Contact Computer */}
        <InteractiveObject
            position={[0, 0.5, -5]}
            label="Contact"
            color="#E74C3C"
            onClick={() => setActiveModal('contact')}
        />

        {/* Decor */}
        <mesh position={[6, 1, 6]} castShadow>
             <boxGeometry args={[1, 2, 1]} />
             <meshStandardMaterial color="#95A5A6" />
        </mesh>

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
