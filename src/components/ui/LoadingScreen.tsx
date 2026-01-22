import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

const TIPS = [
  "Use headphones for the best audio experience.",
  "Check corners for hidden supplies.",
  "You can customize your crosshair in settings.",
  "Press 'J' to check your journal for objectives.",
  "Running consumes stamina, walk to recover.",
  "Red lights indicate restricted areas.",
  "Interact with objects when the reticle changes."
];

export const LoadingScreen: React.FC = ({ progress = 0, showError = false }: any) => {
  const [loadingText, setLoadingText] = useState("Loading...");
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Cycle tips every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoadingText(TIPS[currentTipIndex]);
  }, [currentTipIndex]);

  // Click to start when ready
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      setIsReady(true);
    }
  }, [progress]);

  const handleStart = () => {
    setHasStarted(true);
  };

  // Interactive feature: Click to cycle tips manually
  const cycleTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % TIPS.length);
  };

  return (
    <Html center style={{
      width: '100vw',
      height: '100vh',
      background: '#fffcf5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: '#4a403a',
      fontFamily: '"Outfit", "Inter", sans-serif',
      zIndex: 9999,
      cursor: 'pointer'
    }} onClick={cycleTip}>

      {/* Coffee Cup Animation */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{ fontSize: '80px' }}>☕</div>
        {/* Steam Particles */}
        <div className="steam steam-1"></div>
        <div className="steam steam-2"></div>
        <div className="steam steam-3"></div>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', minHeight: '40px', userSelect: 'none' }}>
        <span style={{ animation: 'fadeInOut 2s infinite' }}>{loadingText}</span>
      </div>

      <div style={{ fontSize: '12px', color: '#8c6a4a', marginBottom: '10px' }}>
        (Tap to change status)
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '300px',
        height: '8px',
        background: '#eaddcf',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#d4a373',
          transition: 'width 0.2s ease-out',
        }} />
      </div>

      <div style={{ marginTop: '10px', color: '#8c6a4a', fontSize: '14px', fontWeight: '500' }}>
        {Math.round(progress)}% READY
      </div>

      {showError && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#d32f2f', marginBottom: '10px' }}>Taking longer than expected...</p>
          <button
            onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
            style={{
              padding: '8px 16px',
              background: '#8d6e63',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '10px'
            }}
          >
            Reload
          </button>
        </div>
      )}

      <style>{`
         @keyframes fadeInOut {
           0% { opacity: 0.6; }
           50% { opacity: 1; }
           100% { opacity: 0.6; }
         }

         .steam {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #d4a373;
            border-radius: 50%;
            opacity: 0;
            top: 0;
            left: 50%;
         }

         .steam-1 { animation: rise 2s infinite 0s; margin-left: -20px; }
         .steam-2 { animation: rise 2s infinite 0.5s; margin-left: 0; }
         .steam-3 { animation: rise 2s infinite 1.0s; margin-left: 20px; }

         @keyframes rise {
            0% { transform: translateY(0) scale(1); opacity: 0; }
            20% { opacity: 0.6; }
            100% { transform: translateY(-40px) scale(2); opacity: 0; }
         }
       `}</style>
    </Html>
  )
}
