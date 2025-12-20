import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import Typewriter from './Typewriter';

interface IntroOverlayProps {
  onComplete: () => void;
  name: string;
  role: string;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete, name, role }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence:
    // 0: Start
    // 1: Show Name (after 500ms)
    // 2: Show Role (after name finishes approx 1.5s)
    // 3: Fade out (after role finishes approx 1.5s)

    const t1 = setTimeout(() => setStep(1), 500);
    const t2 = setTimeout(() => setStep(2), 2500);
    const t3 = setTimeout(() => {
        setStep(3);
        setTimeout(onComplete, 1000); // Wait for fade out
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (step === 3) return null; // Or render fade out state

  return (
    <Html fullscreen style={{ pointerEvents: 'none', zIndex: 5000 }}>
        <div style={{
            width: '100%',
            height: '100%',
            background: 'black',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'opacity 1s',
            opacity: step === 3 ? 0 : 1
        }}>
            {step >= 1 && (
                <h1 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '32px', marginBottom: '20px', color: '#F1C40F' }}>
                    <Typewriter text={name} speed={50} />
                </h1>
            )}
            {step >= 2 && (
                <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: '16px', color: '#aaa' }}>
                    <Typewriter text={role} speed={30} />
                </h2>
            )}
        </div>
    </Html>
  );
};

export default IntroOverlay;
