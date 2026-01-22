import React, { useState, useEffect, useRef } from 'react';
import useGameStore from '../../store';

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
    const tutorialActive = useGameStore(state => state.tutorialActive);
    const skipTutorial = useGameStore(state => state.skipTutorial);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const advancingRef = useRef(false);

    // Handle completion and reset lock on step change
    useEffect(() => {
        advancingRef.current = false;

        // Auto-complete logic for final step
        if (currentStepIndex >= TUTORIAL_STEPS.length - 1) {
             const timer = setTimeout(() => {
                 skipTutorial();
             }, 3000);
             return () => clearTimeout(timer);
        }
    }, [currentStepIndex, skipTutorial]);

    // Safe advance function
    const scheduleAdvance = (delay: number = 500) => {
        if (advancingRef.current) return;

        // Check if we are already at or past the end
        if (currentStepIndex >= TUTORIAL_STEPS.length - 1) return;

        advancingRef.current = true;
        setTimeout(() => {
            setCurrentStepIndex(prev => {
                if (prev < TUTORIAL_STEPS.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, delay);
    };

    useEffect(() => {
        if (!tutorialActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (advancingRef.current) return;

            if (currentStepIndex === 0 && e.code === 'Space') {
                scheduleAdvance(100);
            }
            if (currentStepIndex === 1 && ['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                scheduleAdvance(1000);
            }
            // Interaction step trigger
            if (currentStepIndex === 3 && (e.code === 'KeyE' || e.key.toLowerCase() === 'e')) {
                scheduleAdvance(100);
            }
        };

        const handleMouseMove = () => {
            if (advancingRef.current) return;
            if (currentStepIndex === 2) {
                scheduleAdvance(1000);
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
    }, [currentStepIndex, tutorialActive]); // Re-bind when step changes

    if (!tutorialActive) return null;

    const currentStep = TUTORIAL_STEPS[currentStepIndex];
    if (!currentStep) return null; // Safety check to prevent crash

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
