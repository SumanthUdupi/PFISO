import { Suspense, useState, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Lobby from './scenes/Lobby'
import UIOverlay from './components/ui/UIOverlay'
import { FPSLimiter } from './components/game/FPSLimiter'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { useDeviceDetect } from './hooks/useDeviceDetect'
import projectsData from './assets/data/projects.json'
import bioData from './assets/data/bio.json'
import MobileControls from './components/ui/MobileControls'
import useAudioStore from './audioStore'

function App() {
    const { isMobile, isLandscape } = useDeviceDetect()
    // Determine if we are in portrait mobile mode
    const isPortraitMobile = isMobile && !isLandscape

    // State for collapsing the project section
    const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false)

    // Initialize audio on first interaction
    useEffect(() => {
        const initAudio = () => {
            // Initialize audio context on first user interaction
            useAudioStore.getState().initAudio();

            // Remove listeners once initialized
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };

        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);
        window.addEventListener('touchstart', initAudio);

        return () => {
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        }
    }, []);

    // Flatten skills for mobile display
    const flattenedSkills = bioData.skills.flatMap((cat: any) => cat.items)

    return (
        <>
            {/* 3D Viewport Container */}
            <div
                className={isPortraitMobile ? "mobile-portrait-container" : ""}
                style={isPortraitMobile ? {
                    height: isProjectSectionOpen ? '40dvh' : '90dvh', // Expand when closed
                    transition: 'height 0.3s ease'
                } : {
                    width: '100%',
                    height: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                    touchAction: 'none'
                }}
            >
                <Canvas
                    shadows={!isMobile}
                    gl={{ antialias: true }}
                    orthographic
                    // Initial zoom set to desktop default, Lobby will adjust for mobile
                    camera={{ position: [20, 20, 20], zoom: 40, near: 0.1, far: 1000 }}
                    dpr={[1, 2]} // Clamp pixel ratio
                >
                    <FPSLimiter limit={30} />
                    <OrbitControls
                        makeDefault
                        enableZoom={true}
                        enableRotate={true}
                        enablePan={true}
                        minZoom={10}
                        maxZoom={100}
                        maxPolarAngle={Math.PI / 2}
                    />

                    {/* Decoupled Environment to avoid side-effect warnings during Lobby loading */}
                    <Suspense fallback={null}>
                        <Environment preset="sunset" background={false} />
                    </Suspense>

                    <Suspense fallback={<LoadingScreen />}>
                        <Lobby />
                    </Suspense>
                </Canvas>
                <UIOverlay />
                {isMobile && <MobileControls />}
            </div>

            {/* Portrait Mode Content List */}
            {isPortraitMobile && (
                <>
                    {/* Collapse Toggle Button */}
                    <button
                        onClick={() => setIsProjectSectionOpen(!isProjectSectionOpen)}
                        style={{
                            position: 'absolute',
                            bottom: isProjectSectionOpen ? '60dvh' : '0',
                            left: '50%',
                            transform: 'translateX(-50%) translateY(-100%)',
                            zIndex: 1000,
                            background: '#333',
                            color: 'white',
                            border: 'none',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px',
                            padding: '10px 20px',
                            fontFamily: '"Press Start 2P", cursive',
                            fontSize: '10px',
                            boxShadow: '0 -2px 5px rgba(0,0,0,0.5)',
                            transition: 'bottom 0.3s ease'
                        }}
                    >
                        {isProjectSectionOpen ? '▼ Minimize' : '▲ Projects'}
                    </button>

                    <div className="mobile-content-list" style={{
                        height: isProjectSectionOpen ? '60dvh' : '0',
                        padding: isProjectSectionOpen ? '20px' : '0',
                        transition: 'height 0.3s ease, padding 0.3s ease',
                        overflow: 'hidden', // Hide overflow when closed
                        overflowY: isProjectSectionOpen ? 'auto' : 'hidden'
                    }}>
                        <h2 style={{ fontSize: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>Projects</h2>
                        <div>
                            {projectsData.map((project: any) => (
                                <article key={project.id} className="mobile-project-card">
                                    {project.heroImage && (
                                        <img
                                            src={project.heroImage}
                                            alt={project.title}
                                            className="mobile-project-image"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="mobile-card-content">
                                        <h3 style={{ fontSize: '18px', marginTop: 0, color: '#FFD700', lineHeight: '1.4' }}>{project.title}</h3>
                                        {/* Improved typography for body text */}
                                        <p className="mobile-text-body" style={{
                                            fontSize: '14px', // Fallback
                                            color: '#ccc',
                                            fontFamily: 'Inter, system-ui, sans-serif',
                                            marginBottom: '15px'
                                        }}>
                                            {project.description}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {project.techStack.map((tech: string) => (
                                                <span key={tech} className="mobile-tech-tag">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <h2 style={{ fontSize: '20px', borderBottom: '2px solid #333', paddingBottom: '10px', marginTop: '40px' }}>Skills</h2>
                        <div className="mobile-skills-grid">
                            {flattenedSkills.map((skill: any) => (
                                <div key={skill.name} className="skill-card">
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                                        {/* Default icon if none provided */}
                                        {skill.icon || '🔹'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#ecf0f1', fontFamily: 'Inter, system-ui, sans-serif' }}>{skill.name}</div>
                                    {skill.level && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>{skill.level}</div>}
                                </div>
                            ))}
                        </div>

                        <div style={{ height: '80px', textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#666' }}>
                            Swipe up for more...
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default App
