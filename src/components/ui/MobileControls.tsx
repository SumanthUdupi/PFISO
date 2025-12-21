import React, { useRef, useEffect, useState } from 'react';
import useControlsStore from '../../stores/controlsStore';

const MobileControls: React.FC = () => {
    const { setJoystick, setActionPressed } = useControlsStore();
    const joystickContainerRef = useRef<HTMLDivElement>(null);
    const stickRef = useRef<HTMLDivElement>(null);
    const [touchId, setTouchId] = useState<number | null>(null);

    // Joystick Logic
    const handleTouchStart = (e: React.TouchEvent) => {
        if (touchId !== null) return;
        const touch = e.changedTouches[0];
        setTouchId(touch.identifier);
        updateJoystick(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
        if (touch) {
            updateJoystick(touch.clientX, touch.clientY);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId);
        if (touch) {
            setTouchId(null);
            setJoystick(0, 0);
            if (stickRef.current) {
                stickRef.current.style.transform = `translate(0px, 0px)`;
            }
        }
    };

    const updateJoystick = (clientX: number, clientY: number) => {
        if (!joystickContainerRef.current || !stickRef.current) return;

        const containerRect = joystickContainerRef.current.getBoundingClientRect();
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

        // Update Stick Visual
        stickRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Update Store (Normalized -1 to 1)
        // Invert Y because screen Y is down, but typically Up is negative in 2D,
        // but in 3D Z is down/forward.
        // Player.tsx: inputVector.z -= 1 (w/Up) -> Negative Z is forward.
        // Screen Y Up (negative pixel delta) -> Should be forward (Negative Z).
        // So Y input matches Z output directly?
        // Let's normalize: Up (negative deltaY) -> -1. Down (positive deltaY) -> 1.

        const normX = deltaX / maxRadius;
        const normY = deltaY / maxRadius;

        setJoystick(normX, normY);
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            height: '150px',
            pointerEvents: 'none', // Allow clicks through empty space
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            zIndex: 1000
        }}>
            {/* Joystick Zone */}
            <div
                ref={joystickContainerRef}
                style={{
                    width: '120px',
                    height: '120px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    position: 'relative',
                    pointerEvents: 'auto',
                    touchAction: 'none'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={stickRef}
                    style={{
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 215, 0, 0.5)', // Gold
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-25px',
                        marginLeft: '-25px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    }}
                />
            </div>

            {/* Action Button */}
            <button
                style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255, 87, 34, 0.8)', // Orange/Red
                    border: '4px solid #fff',
                    color: 'white',
                    fontSize: '24px',
                    fontFamily: '"Press Start 2P", cursive',
                    pointerEvents: 'auto',
                    touchAction: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 0 #bf360c'
                }}
                onTouchStart={(e) => { e.preventDefault(); setActionPressed(true); }}
                onTouchEnd={(e) => { e.preventDefault(); setActionPressed(false); }}
                onMouseDown={() => setActionPressed(true)}
                onMouseUp={() => setActionPressed(false)}
            >
                A
            </button>
        </div>
    );
};

export default MobileControls;
