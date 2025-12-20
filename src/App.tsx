import React, { Suspense } from 'react'
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
  const { isMobile, isLandscape } = useDeviceDetect()
  // Determine if we are in portrait mobile mode
  const isPortraitMobile = isMobile && !isLandscape

  return (
    <>
      {/* 3D Viewport Container */}
      <div style={{
        width: '100%',
        height: isPortraitMobile ? '40vh' : '100vh',
        position: 'relative',
        overflow: 'hidden',
        // Prevent scroll on the canvas container
        touchAction: 'none'
      }}>
        <Canvas
            shadows={!isMobile}
            gl={{ shadowMap: { type: THREE.PCFSoftShadowMap } }}
            orthographic
            // Initial zoom set to desktop default, Lobby will adjust for mobile
            camera={{ position: [20, 20, 20], zoom: 40, near: 0.1, far: 1000 }}
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
            borderTop: '4px solid #333',
            boxSizing: 'border-box'
        }}>
            <h2 style={{ fontSize: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>Projects</h2>
            <div style={{ display: 'grid', gap: '30px' }}>
                {projectsData.map((project: any) => (
                    <article key={project.id} style={{ background: '#222', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ fontSize: '18px', marginTop: 0, color: '#FFD700', lineHeight: '1.4' }}>{project.title}</h3>
                        {/* Improved typography for body text */}
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#ccc',
                            fontFamily: 'Inter, system-ui, sans-serif'
                        }}>
                            {project.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '15px' }}>
                            {project.techStack.map((tech: string) => (
                                <span key={tech} style={{
                                    background: '#333',
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontFamily: 'Inter, system-ui, sans-serif'
                                }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>

            <h2 style={{ fontSize: '20px', borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '40px' }}>Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {bioData.skills.map((skill: any) => (
                     <div key={skill.name} style={{ background: '#2c3e50', padding: '16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px', flex: '1' }}>
                         <div style={{ fontSize: '32px', marginBottom: '10px' }}>{skill.icon}</div>
                         <div style={{ fontSize: '12px', color: '#ecf0f1', fontFamily: 'Inter, system-ui, sans-serif' }}>{skill.name}</div>
                     </div>
                ))}
            </div>

            <div style={{ height: '80px', textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#666' }}>
                Swipe up for more...
            </div>
        </div>
      )}

      <Loader />
    </>
  )
}

export default App
