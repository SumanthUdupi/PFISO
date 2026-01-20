import React, { useState, useEffect } from 'react';

type TutorialStep = {
    id: string;
    title: string;
    instruction: string;
    trigger?: () => boolean; // Optional condition to auto-advance
};

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to PFISO',
        instruction: 'Press SPACE to begin the tutorial.',
    },
    {
        id: 'movement',
        title: 'Movement',
        instruction: 'Use W, A, S, D to move around the office.',
    },
    {
        id: 'camera',
        title: 'Camera',
        instruction: 'Move your mouse to look around.',
    },
    {
        id: 'interaction',
        title: 'Interaction',
        instruction: 'Look at highlight objects and press E to interact.',
    },
    {
        id: 'complete',
        title: 'Tutorial Complete',
        instruction: 'You are ready! Explore the office.',
    }
];

export const TutorialOverlay: React.FC = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (currentStepIndex === 0 && e.code === 'Space') {
                advanceStep();
            }
            // Simple movement check logic simulation for tutorial purposes
            if (currentStepIndex === 1 && ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                setTimeout(advanceStep, 1000); // Advance after 1s of movement
            }
        };

        const handleMouseMove = () => {
            if (currentStepIndex === 2) {
                // Simulate camera movement check
                setTimeout(advanceStep, 1000);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        if (currentStepIndex === 2) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [currentStepIndex]);

    const advanceStep = () => {
        if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setTimeout(() => setIsVisible(false), 2000);
        }
    };

    if (!isVisible) return null;

    const currentStep = TUTORIAL_STEPS[currentStepIndex];

    return (
        <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center',
            zIndex: 1000,
            pointerEvents: 'none',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            minWidth: '300px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#4fd1c5' }}>{currentStep.title}</h3>
            <p style={{ margin: 0, fontSize: '1rem' }}>{currentStep.instruction}</p>
            <div style={{ marginTop: '15px', fontSize: '0.8rem', opacity: 0.7 }}>
                Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
            </div>
        </div>
    );
};
