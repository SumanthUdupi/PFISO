import React, { useRef } from 'react';
import useControlsStore from '../../stores/controlsStore';
import VirtualJoystick from './VirtualJoystick';
import useCameraStore from '../../stores/cameraStore';

const MobileControls: React.FC = () => {
    const { setJoystick, setLookVector, setActionPressed, setJumpPressed, setCrouchPressed } = useControlsStore();
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);
    const pinchStartDist = useRef<number>(0);

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            pinchStartDist.current = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }

    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (pinchStartDist.current > 0) {
                const delta = dist - pinchStartDist.current;
                const { zoomLevel, setZoomLevel } = useCameraStore.getState()
                setZoomLevel(zoomLevel - (delta * 0.005));
                pinchStartDist.current = dist // Reset for continuous delta
            }
        }
    }

    const onTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length === 0) {
            touchStartRef.current = null;
            pinchStartDist.current = 0;
        }

        if (!touchStartRef.current) return;
        // ... (existing swipe logic)
        const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
        const threshold = 50;
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
            if (deltaY < 0) { // swipe up
                setJumpPressed(true);
                setTimeout(() => setJumpPressed(false), 100);
            } else { // swipe down
                setCrouchPressed(true);
                setTimeout(() => setCrouchPressed(false), 100);
            }
        }
    };

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '20px 40px'
        }}>
            {/* Left Stick - Movement */}
            <div style={{ position: 'relative', width: '150px', height: '150px', pointerEvents: 'none' }}>
                <VirtualJoystick
                    onMove={setJoystick}
                    position={{ bottom: '20px', left: '20px' }}
                />
            </div>

            {/* Right Group: Action Button & Look Stick */}
            <div style={{ position: 'relative', width: '250px', height: '150px', pointerEvents: 'none', display: 'flex', gap: '20px', alignItems: 'flex-end' }}>

                {/* Action Button (A) */}
                <button
                    style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'rgba(255, 87, 34, 0.9)', // Orange
                        border: '3px solid #fff',
                        color: 'white',
                        fontSize: '20px',
                        fontFamily: '"Press Start 2P", cursive',
                        pointerEvents: 'auto',
                        touchAction: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        marginBottom: '20px' // Align with joystick center roughly
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        setActionPressed(true);
                        if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
                    }}
                    onTouchEnd={(e) => { e.preventDefault(); setActionPressed(false); }}
                    aria-label="Interact"
                >
                    A
                </button>

                {/* Right Stick - Look */}
                <VirtualJoystick
                    onMove={(x, y) => setLookVector(x, y)} // Pass raw x,y (normalized)
                    position={{ bottom: '20px', right: '0px' }}
                    color="rgba(0, 0, 0, 0.2)"
                />
            </div>

            {/* Gesture Layer */}
            <div
                style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', background: 'transparent' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            ></div>
        </div>
    );
};

export default MobileControls;
