import React, { Suspense } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Loader, OrbitControls } from '@react-three/drei'
import Lobby from './scenes/Lobby'
import UIOverlay from './components/ui/UIOverlay'

function App() {
  return (
    <>
      <Canvas
        shadows
        gl={{ shadowMap: { type: THREE.SoftShadowMap } }}
        orthographic
        camera={{ position: [20, 20, 20], zoom: 40, near: 0.1, far: 1000 }}
      >
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
        <Suspense fallback={null}>
          <Lobby />
        </Suspense>
      </Canvas>
      <UIOverlay />
      <Loader />
    </>
  )
}

export default App
