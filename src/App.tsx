import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import Lobby from './scenes/Lobby'
import UIOverlay from './components/ui/UIOverlay'
import Scanlines from './components/ui/Scanlines'

function App() {
  return (
    <>
      <Scanlines />
      <Canvas
        shadows
        orthographic
        camera={{ position: [20, 20, 20], zoom: 40, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <Lobby />
        </Suspense>
        {/* Lights in Lobby will handle illumination */}
      </Canvas>
      <UIOverlay />
      <Loader />
    </>
  )
}

export default App
