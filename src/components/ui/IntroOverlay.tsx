import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import Typewriter from './Typewriter';
import { useDeviceDetect } from '../../hooks/useDeviceDetect';

interface IntroOverlayProps {
  onComplete: () => void;
  name: string;
  headline: string;
  valueProposition: string;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onComplete, name, headline, valueProposition }) => {
  const [step, setStep] = useState(0);
  const { isMobile } = useDeviceDetect();

  useEffect(() => {
    // Sequence:
    // 0: Start
    // 1: Show Name (after 500ms)
    // 2: Show Headline (after name finishes approx 1.5s)
    // 3: Show Value Prop (after headline finishes approx 2.0s)
    // 4: Fade out (after value prop finishes reading approx 5.0s)

    const t1 = setTimeout(() => setStep(1), 500);
    const t2 = setTimeout(() => setStep(2), 2000);
    const t3 = setTimeout(() => setStep(3), 4500);
    const t4 = setTimeout(() => {
        setStep(4);
        setTimeout(onComplete, 1000); // Wait for fade out
    }, 12000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (step === 4) return null; // Or render fade out state

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
            opacity: step === 4 ? 0 : 1,
            // Adjust position for mobile split view
            paddingBottom: isMobile ? '20%' : '0',
            paddingLeft: '20px',
            paddingRight: '20px'
        }}>
            {step >= 1 && (
                <h1 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: isMobile ? '24px' : '32px', marginBottom: '20px', color: '#ffa726', textAlign: 'center' }}>
                    <Typewriter text={name} speed={50} />
                </h1>
            )}
            {step >= 2 && (
                <h2 style={{ fontFamily: '"Press Start 2P", cursive', fontSize: isMobile ? '12px' : '16px', color: '#aaa', textAlign: 'center', marginBottom: '30px', maxWidth: '800px' }}>
                    <Typewriter text={headline} speed={30} />
                </h2>
            )}
            {step >= 3 && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '14px' : '18px', color: '#fff', textAlign: 'center', maxWidth: '600px', lineHeight: 1.6, background: 'rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
                    <Typewriter text={valueProposition} speed={10} />
                </div>
            )}
        </div>
    </Html>
  );
};

export default IntroOverlay;
