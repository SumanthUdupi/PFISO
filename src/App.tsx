import { Suspense, useState, useEffect, lazy } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
const Level_01 = lazy(() => import('./scenes/Level_01'))
// import HUD from './components/ui/HUD' // Removed default import to fix conflict
const InventoryUI = lazy(() => import('./components/ui/InventoryUI'))
const PauseMenu = lazy(() => import('./components/ui/PauseMenu'))
const GameOverScreen = lazy(() => import('./components/ui/GameOverScreen'))
const UIOverlay = lazy(() => import('./components/ui/UIOverlay'))
const InfoModal = lazy(() => import('./components/ui/InfoModal').then(module => ({ default: module.InfoModal })))
const EndingScreen = lazy(() => import('./components/ui/EndingScreen'))
const HUD = lazy(() => import('./components/ui/HUD').then(module => ({ default: module.HUD })))
const SkillsMenu = lazy(() => import('./components/ui/SkillsMenu').then(module => ({ default: module.SkillsMenu })))
const SystemMenu = lazy(() => import('./components/ui/SystemMenu').then(module => ({ default: module.SystemMenu })))
const FPSLimiter = lazy(() => import('./components/game/FPSLimiter').then(module => ({ default: module.FPSLimiter })))
const LoadingScreen = lazy(() => import('./components/ui/LoadingScreen').then(module => ({ default: module.LoadingScreen })))
import { DebugConsole } from './components/ui/DebugConsole'
import Reticle from './components/ui/Reticle'
import { useDeviceDetect } from './hooks/useDeviceDetect'
import projectsData from './assets/data/projects.json'
import bioData from './assets/data/bio.json'
const MobileControls = lazy(() => import('./components/ui/MobileControls'))
const NavigationSuggestions = lazy(() => import('./components/ui/NavigationSuggestions'))
const FeedbackSurvey = lazy(() => import('./components/ui/FeedbackSurvey'))
const InteractionManager = lazy(() => import('./systems/InteractionManager'))
const CameraShake = lazy(() => import('./components/game/CameraShake'))
const PhotoOverlay = lazy(() => import('./components/ui/PhotoOverlay'))
const BuffHUD = lazy(() => import('./components/ui/BuffHUD').then(module => ({ default: module.BuffHUD })))
const ProjectModal = lazy(() => import('./components/ui/ProjectModal'))
import PortraitWarning from './components/ui/PortraitWarning'
const PerformanceMonitor = lazy(() => import('./components/debug/PerformanceMonitor'))
import { useUIStore } from './stores/uiStore'
import { TelemetryManager } from './systems/TelemetryManager'
import useAudioStore from './audioStore'
import useGameStore from './store'
import Hotbar from './components/ui/Hotbar'
import { resolveAssetPath } from './utils/assetUtils'
import ErrorBoundary from './components/ui/ErrorBoundary'


// const CameraSystem = lazy(() => import('./systems/CameraSystem')) // Moved to Level_01

// ...

// Helper for Debug Mode (could be state or env)
const DEBUG_MODE = false;

function App() {
    const { isMobile, isLandscape } = useDeviceDetect()
    // Determine if we are in portrait mobile mode
    const isPortraitMobile = isMobile && !isLandscape

    // Fix useGameStore usage:
    const motesCollected = useGameStore(state => state.motesCollected)
    const hasShownSurvey = useGameStore(state => state.hasShownSurvey)
    const isPhotoMode = useGameStore(state => state.isPhotoMode)
    const { isProjectModalOpen, toggleProjectModal } = useUIStore()

    // State for collapsing the project section
    const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(false)

    // Initialize audio on first interaction
    useEffect(() => {
        // Preload Assets
        import('./systems/AssetLoader').then(({ preloadAssets }) => preloadAssets());

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

    // Load saved game state
    useEffect(() => {
        useGameStore.getState().loadGame();
    }, []);

    // Flatten skills for mobile display
    const flattenedSkills = bioData.skills.flatMap((cat: any) => cat.items)

    return (
        <>
            {/* 3D Viewport Container */}
            <div
                className={`app-container ${isPortraitMobile ? "mobile-portrait-container" : ""}`}
            >
                <Canvas
                    shadows={!isMobile}
                    gl={{ antialias: true }}
                    dpr={[1, 2]} // Clamp pixel ratio for consistent performance
                >
                    <FPSLimiter limit={30} />

                    {/* Camera System (Handles View) */}
                    {/* Camera System moved to Level_01 to access Physics */}

                    {/* Debug Orbit Controls */}
                    {DEBUG_MODE && <OrbitControls
                        makeDefault
                        enableZoom={true}
                        enableRotate={true}
                        enablePan={true}
                        minZoom={10}
                        maxZoom={100}
                        maxPolarAngle={Math.PI / 2}
                    />}



                    <ErrorBoundary fallback={null}>
                        <Suspense fallback={<LoadingScreen />}>
                            <Level_01 />
                            <InteractionManager />
                            <TelemetryManager />
                            <CameraShake />
                        </Suspense>
                    </ErrorBoundary>
                </Canvas >

                {isMobile && <Suspense fallback={null}><MobileControls /></Suspense>
                }
            </div >

            {/* UI Layer - Outside container to ensure fixed positioning works */}
            < Suspense fallback={null} >
                {isPhotoMode && <PhotoOverlay />}
                {
                    !isPhotoMode && (
                        <>
                            <UIOverlay />
                            <PerformanceMonitor />
                            <DebugConsole />
                            <HUD />
                            <Hotbar />
                            <BuffHUD />
                            <Reticle />
                            <SkillsMenu />
                            <SystemMenu />
                            <InfoModal />
                            <ProjectModal isOpen={isProjectModalOpen} onClose={toggleProjectModal} projects={projectsData} />
                            <EndingScreen />
                            <InventoryUI />
                            <PauseMenu />
                            <GameOverScreen />
                            <NavigationSuggestions />
                            <PortraitWarning />
                            {motesCollected >= 5 && !hasShownSurvey && <FeedbackSurvey onClose={() => useGameStore.getState().setHasShownSurvey()} />}
                        </>
                    )
                }
            </Suspense >

            {/* Portrait Mode Content List */}
            {
                isPortraitMobile && (
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
                                background: '#fffcf5', // cozy-bg
                                color: '#4a403a',      // cozy-text
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
                            overflowY: isProjectSectionOpen ? 'auto' : 'hidden',
                            backgroundColor: '#fffcf5' // cozy-bg
                        }}>
                            <h2 style={{ fontSize: '20px', borderBottom: '2px solid #eaddcf', paddingBottom: '10px', color: '#4a403a' }}>Projects</h2>
                            <div>
                                {projectsData.map((project: any) => (
                                    <article key={project.id} className="mobile-project-card">
                                        {project.heroImage && (
                                            <img
                                                src={resolveAssetPath(project.heroImage)}
                                                alt={project.title}
                                                className="mobile-project-image"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <div className="mobile-card-content">
                                            <h3 style={{ fontSize: '18px', marginTop: 0, color: '#d4a373', lineHeight: '1.4' }}>{project.title}</h3>
                                            <p className="mobile-text-body" style={{
                                                fontSize: '14px', // Fallback
                                                color: '#4a403a', // cozy-text
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

                            <h2 style={{ fontSize: '20px', borderBottom: '2px solid #eaddcf', paddingBottom: '10px', marginTop: '40px', color: '#4a403a' }}>Skills</h2>
                            <div className="mobile-skills-grid">
                                {flattenedSkills.map((skill: any) => (
                                    <div key={skill.name} className="skill-card">
                                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                                            {/* Default icon if none provided */}
                                            {skill.icon || '🔹'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#4a403a', fontFamily: 'Inter, system-ui, sans-serif' }}>{skill.name}</div>
                                        {skill.level && <div style={{ fontSize: '10px', color: '#8c8c8c', marginTop: '4px' }}>{skill.level}</div>}
                                    </div>
                                ))}
                            </div>

                            <div style={{ height: '80px', textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#a1887f' }}>
                                Swipe up for more...
                            </div>
                        </div>
                    </>
                )
            }
        </>
    )
}

export default App
