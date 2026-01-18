import React, { useEffect, useState } from 'react'
import { Html, useProgress } from '@react-three/drei'

export const LoadingScreen = () => {
  const { progress } = useProgress()
  const [loadingText, setLoadingText] = useState('Brewing morning coffee...');
  const [showError, setShowError] = useState(false);

  // Cycle cozy loading messages
  useEffect(() => {
    const messages = [
      'Brewing morning coffee...',
      'Watering the succulents...',
      'Organizing the desk...',
      'Booting up the PC...',
      'Adjusting the chair...',
      'Opening the blinds...',
      'Stacking papers...',
      'Finding the perfect playlist...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timeout Logic
  useEffect(() => {
    const timer = setTimeout(() => {
        if (progress < 100) {
            setShowError(true);
        }
    }, 15000); // 15 seconds timeout
    return () => clearTimeout(timer);
  }, [progress]);

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
        zIndex: 9999
    }}>

      {/* Coffee Cup Animation */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
          <div style={{ fontSize: '80px' }}>☕</div>
          {/* Steam Particles */}
          <div className="steam steam-1"></div>
          <div className="steam steam-2"></div>
          <div className="steam steam-3"></div>
      </div>

      <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', minHeight: '40px' }}>
        <span style={{ animation: 'fadeInOut 2s infinite' }}>{loadingText}</span>
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
                onClick={() => window.location.reload()}
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
