import React, { useEffect, useState } from 'react'
import { Html, useProgress } from '@react-three/drei'
import SpriteIcon from './SpriteIcon';

export const LoadingScreen = () => {
  const { progress } = useProgress()
  const [frame, setFrame] = useState(0);

  // Simple animation loop for the running character
  useEffect(() => {
    const interval = setInterval(() => {
        setFrame(f => (f + 1) % 4); // Assuming 4 frames for walking
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Don't show if complete
  if (progress === 100) return null

  return (
    <Html center style={{ width: '100vw', height: '100vh', background: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white', fontFamily: '"Press Start 2P", cursive' }}>
       <div style={{ marginBottom: '40px' }}>
         <div style={{
            width: '128px',
            height: '128px',
            backgroundImage: 'url(./assets/sprites/player-walk.webp)',
            backgroundPosition: `-${frame * 128}px 0px`, // Scale 32->128 is 4x. So shift is 32*4 = 128.
            backgroundSize: '512px 128px', // 128*4 x 32*4
            imageRendering: 'pixelated'
         }} />
       </div>

       <div style={{ marginBottom: '20px', fontSize: '24px', textAlign: 'center', lineHeight: '1.5' }}>
           COMPILING AWESOMENESS...<br/>
           <span style={{ fontSize: '12px', color: '#BDC3C7' }}>INITIALIZING VIRTUAL OFFICE</span>
       </div>
       <div style={{ width: '300px', height: '20px', border: '2px solid white', padding: '2px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#2ECC71', transition: 'width 0.2s' }} />
       </div>
       <div style={{ marginTop: '10px' }}>{Math.round(progress)}%</div>
    </Html>
  )
}
