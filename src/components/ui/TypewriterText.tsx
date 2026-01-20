import React, { useState, useEffect } from 'react';
import useAudioStore from '../../audioStore';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
    onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 30, delay = 0, className, style, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        const startTimer = setTimeout(() => {
            setHasStarted(true);
        }, delay * 1000);
        return () => clearTimeout(startTimer);
    }, [delay]);

    useEffect(() => {
        if (!hasStarted) return;
        if (isComplete) {
            setDisplayedText(text);
            return;
        }

        let i = 0;
        const interval = setInterval(() => {
            if (i >= text.length) {
                clearInterval(interval);
                setIsComplete(true);
                if (onComplete) onComplete();
                return;
            }
            setDisplayedText(text.substring(0, i + 1));

            // AUD-013: Typewriter Sound
            // Play a soft click on every character
            // We use 'hover' type as it is short and soft, or 'click'
            // Using direct store access to avoid re-renders of valid hook usage inside interval
            // unless we ref it.
            useAudioStore.getState().playSound('click');

            i++;
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, hasStarted, isComplete, onComplete]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isComplete) {
            setIsComplete(true);
            setDisplayedText(text);
            if (onComplete) onComplete();
        }
    };

    return (
        <span
            className={className}
            style={{ ...style, cursor: isComplete ? 'auto' : 'pointer' }}
            onClick={handleClick}
            title={!isComplete ? "Click to skip" : undefined}
        >
            {displayedText}
            {!isComplete && hasStarted && <span className="animate-pulse">|</span>}
        </span>
    );
};

export default TypewriterText;
