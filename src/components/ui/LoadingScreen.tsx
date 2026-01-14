import React, { useEffect, useState } from 'react'
import { Html, useProgress } from '@react-three/drei'

export const LoadingScreen = () => {
  const { progress } = useProgress()
  const [frame, setFrame] = useState(0);
  const [loadingText, setLoadingText] = useState('COMPILING AWESOMENESS...');

  // Animation loop for sprite
  useEffect(() => {
    const interval = setInterval(() => {
        setFrame(f => (f + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Cycle loading messages
  useEffect(() => {
      const messages = [
          'COMPILING AWESOMENESS...',
          'PIXELATING WORLD...',
          'GENERATING VOXELS...',
          'BREWING COFFEE...',
          'LOADING ASSETS...',
          'INITIALIZING PHYSICS...',
          'OPTIMIZING SHADERS...'
      ];
      let i = 0;
      const interval = setInterval(() => {
          i = (i + 1) % messages.length;
          setLoadingText(messages[i]);
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  if (progress === 100) return null

  return (
    <Html center style={{ width: '100vw', height: '100vh', background: '#2C3E50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white', fontFamily: '"Press Start 2P", cursive', zIndex: 9999 }}>
       <div style={{ marginBottom: '40px', position: 'relative' }}>
         <div style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             width: '200px',
             height: '200px',
             background: 'radial-gradient(circle, rgba(46, 204, 113, 0.2) 0%, rgba(0,0,0,0) 70%)',
             borderRadius: '50%',
             zIndex: -1
         }} />
         <div style={{
            width: '128px',
            height: '128px',
            backgroundImage: `url(${import.meta.env.BASE_URL}assets/sprites/player-walk.webp)`,
            backgroundPosition: `-${frame * 128}px -128px`,
            backgroundSize: '1024px 512px',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated'
         }} />
       </div>

       <div style={{ marginBottom: '30px', fontSize: '20px', textAlign: 'center', lineHeight: '1.5', minHeight: '60px', color: '#ecf0f1' }}>
           <span style={{ animation: 'pulse 1.5s infinite' }}>{loadingText}</span>
       </div>

       <div style={{ width: '300px', height: '24px', border: '4px solid #34495e', background: '#1a252f', padding: '2px', borderRadius: '4px', position: 'relative' }}>
          <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2ecc71, #27ae60)',
              transition: 'width 0.2s ease-out',
              boxShadow: '0 0 10px rgba(46, 204, 113, 0.5)'
          }} />
       </div>

       <div style={{ marginTop: '15px', color: '#95a5a6', fontSize: '12px' }}>
           {Math.round(progress)}% COMPLETE
       </div>

       <style>{`
         @keyframes pulse {
           0% { opacity: 0.7; transform: scale(0.98); }
           50% { opacity: 1; transform: scale(1); }
           100% { opacity: 0.7; transform: scale(0.98); }
         }
       `}</style>
    </Html>
  )
}
