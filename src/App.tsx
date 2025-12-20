import React, { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Loader, OrbitControls } from '@react-three/drei'
import Lobby from './scenes/Lobby'
import UIOverlay from './components/ui/UIOverlay'
import { FPSLimiter } from './components/game/FPSLimiter'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { useDeviceDetect } from './hooks/useDeviceDetect'
import projectsData from './assets/data/projects.json'
import bioData from './assets/data/bio.json'

function App() {
  const [zoom, setZoom] = useState(40)
  const { isMobile, isLandscape } = useDeviceDetect()
  // Determine if we are in portrait mobile mode
  const isPortraitMobile = isMobile && !isLandscape

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setZoom(20) // Zoom in on mobile
      } else {
        setZoom(40)
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      {/* 3D Viewport Container */}
      <div style={{
        width: '100%',
        height: isPortraitMobile ? '40vh' : '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Canvas
            shadows
            gl={{ shadowMap: { type: THREE.PCFSoftShadowMap } }}
            orthographic
            camera={{ position: [20, 20, 20], zoom: zoom, near: 0.1, far: 1000 }}
            dpr={[1, 2]} // Clamp pixel ratio
        >
            <FPSLimiter limit={30} />
            <OrbitControls
                enableZoom={true}
                enableRotate={true}
                enablePan={true}
                mouseButtons={{
                    LEFT: THREE.MOUSE.PAN,
                    MIDDLE: THREE.MOUSE.ROTATE,
                    RIGHT: THREE.MOUSE.PAN
                }}
                minZoom={10}
                maxZoom={100}
                maxPolarAngle={Math.PI / 2}
            />
            <Suspense fallback={<LoadingScreen />}>
            <Lobby />
            </Suspense>
        </Canvas>
        <UIOverlay />
      </div>

      {/* Portrait Mode Content List */}
      {isPortraitMobile && (
        <div style={{
            height: '60vh',
            overflowY: 'auto',
            background: '#111',
            color: 'white',
            padding: '20px',
            fontFamily: '"Press Start 2P", cursive',
            borderTop: '4px solid #333'
        }}>
            <h2 style={{ fontSize: '16px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>Projects</h2>
            <div style={{ display: 'grid', gap: '20px' }}>
                {projectsData.map((project: any) => (
                    <div key={project.id} style={{ background: '#222', padding: '15px', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '14px', marginTop: 0, color: '#FFD700', lineHeight: '1.4' }}>{project.title}</h3>
                        <p style={{ fontSize: '10px', lineHeight: '1.6', color: '#ccc' }}>{project.description}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {project.techStack.map((tech: string) => (
                                <span key={tech} style={{ background: '#333', padding: '4px 8px', fontSize: '8px', borderRadius: '4px', color: '#fff' }}>{tech}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <h2 style={{ fontSize: '16px', borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '40px' }}>Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {bioData.skills.map((skill: any) => (
                     <div key={skill.name} style={{ background: '#2c3e50', padding: '12px', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
                         <div style={{ fontSize: '24px', marginBottom: '8px' }}>{skill.icon}</div>
                         <div style={{ fontSize: '10px', color: '#ecf0f1' }}>{skill.name}</div>
                     </div>
                ))}
            </div>

            <div style={{ height: '50px', textAlign: 'center', marginTop: '40px', fontSize: '10px', color: '#666' }}>
                Swipe up for more...
            </div>
        </div>
      )}

      <Loader />
    </>
  )
}

export default App
