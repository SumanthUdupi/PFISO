import React, { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Loader, OrbitControls } from '@react-three/drei'
import Lobby from './scenes/Lobby'
import UIOverlay from './components/ui/UIOverlay'
import { FPSLimiter } from './components/game/FPSLimiter'
import { LoadingScreen } from './components/ui/LoadingScreen'

function App() {
  const [zoom, setZoom] = useState(40)

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
      <Loader />
    </>
  )
}

export default App
