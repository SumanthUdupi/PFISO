import React from 'react';
import useControlsStore from '../../stores/controlsStore';
import VirtualJoystick from './VirtualJoystick';
import useCameraStore from '../../stores/cameraStore';

const MobileControls: React.FC = () => {
    const { setJoystick, setLookVector, setActionPressed } = useControlsStore();

    // Gestures are now handled by CameraSystem and InputManager directly on the Canvas/Window
    // to avoid overlay blocking issues.

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
            <div style={{ position: 'relative', width: '150px', height: '150px', pointerEvents: 'auto' }}>
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
                        marginBottom: '20px'
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        setActionPressed(true);
                        if (navigator.vibrate) navigator.vibrate(50);
                    }}
                    onTouchEnd={(e) => { e.preventDefault(); setActionPressed(false); }}
                    aria-label="Interact"
                >
                    A
                </button>

                {/* Right Stick - Look */}
                <div style={{ pointerEvents: 'auto', width: '100px', height: '100px', position: 'relative' }}>
                    <VirtualJoystick
                        onMove={(x, y) => setLookVector(x, y)}
                        position={{ bottom: '20px', right: '0px' }}
                        color="rgba(0, 0, 0, 0.2)"
                    />
                </div>
            </div>
        </div>
    );
};

export default MobileControls;
