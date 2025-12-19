import React from 'react'
import { Html, useProgress } from '@react-three/drei'

export const LoadingScreen = () => {
  const { progress } = useProgress()

  // Don't show if complete
  if (progress === 100) return null

  return (
    <Html center style={{ width: '100vw', height: '100vh', background: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white', fontFamily: '"Press Start 2P", cursive' }}>
       <div style={{ marginBottom: '20px', fontSize: '24px' }}>LOADING OFFICE...</div>
       <div style={{ width: '300px', height: '20px', border: '2px solid white', padding: '2px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#2ECC71', transition: 'width 0.2s' }} />
       </div>
       <div style={{ marginTop: '10px' }}>{Math.round(progress)}%</div>
    </Html>
  )
}
