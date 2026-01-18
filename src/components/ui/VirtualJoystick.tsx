import React, { useRef, useState } from 'react';

interface VirtualJoystickProps {
    onMove: (x: number, y: number) => void;
    position: { left?: string; right?: string; bottom?: string; top?: string };
    color?: string;
}

const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, position, color = 'rgba(255, 255, 255, 0.1)' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const [touchId, setTouchId] = useState<number | null>(null);
    const [active, setActive] = useState(false);

    // Initial position logic (center of container)
    // We update stick transform manually for performance

    // Reset function
    const reset = () => {
        setTouchId(null);
        setActive(false);
        onMove(0, 0);
        if (stickRef.current) {
            stickRef.current.style.transform = `translate(0px, 0px)`;
            stickRef.current.style.transition = 'transform 0.1s ease-out';
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (touchId !== null) return; // Already active

        // Use the first changed touch
        const touch = e.changedTouches[0];
        setTouchId(touch.identifier);
        setActive(true);

        if (stickRef.current) {
            stickRef.current.style.transition = 'none'; // Instant movement
        }

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(30);

        updateJoystick(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchId === null) return;

        // Find our touch
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
        if (touch) {
            updateJoystick(touch.clientX, touch.clientY);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchId === null) return;

        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
        if (touch) {
            reset();
        }
    };

    const updateJoystick = (clientX: number, clientY: number) => {
        if (!containerRef.current || !stickRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        const maxRadius = containerRect.width / 2 - stickRef.current.offsetWidth / 2;

        let deltaX = clientX - centerX;
        let deltaY = clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > maxRadius) {
            const angle = Math.atan2(deltaY, deltaX);
            deltaX = Math.cos(angle) * maxRadius;
            deltaY = Math.sin(angle) * maxRadius;
        }

        // Visual update
        stickRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Value update (-1 to 1)
        const normX = deltaX / maxRadius;
        const normY = deltaY / maxRadius;
        onMove(normX, normY);
    };

    return (
        <div
            ref={containerRef}
            style={{
                ...position,
                position: 'absolute',
                width: '120px',
                height: '120px',
                background: active ? 'rgba(255, 255, 255, 0.2)' : color,
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                touchAction: 'none',
                pointerEvents: 'auto',
                transition: 'background 0.2s'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            <div
                ref={stickRef}
                style={{
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255, 215, 0, 0.8)',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginLeft: '-25px',
                    marginTop: '-25px',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

export default VirtualJoystick;
