import React from 'react';

interface CrosshairProps {
    color?: string;
    size?: number;
    gap?: number;
    thickness?: number;
}

export const Crosshair: React.FC<CrosshairProps> = ({
    color = 'rgba(255, 255, 255, 0.8)',
    size = 20,
    gap = 4,
    thickness = 2
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 999
        }}>
            {/* Horizontal Line */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${size}px`,
                height: `${thickness}px`,
                backgroundColor: color,
                borderRadius: '1px'
            }} />

            {/* Vertical Line */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${thickness}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: '1px'
            }} />

            {/* Center Gap (Optional - creates the gap effect by masking) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${gap}px`,
                height: `${gap}px`,
                backgroundColor: 'transparent'
                // Note: Real masking would be better, but for now we rely on the gap being part of the design or just lines separated.
                // Actually, to make a gap, we should render 4 separate lines. Let's do that for better customization.
            }} />
        </div>
    );
};

export const CustomCrosshair: React.FC<CrosshairProps> = ({
    color = 'white',
    size = 24,
    gap = 6,
    thickness = 2
}) => {
    // 4 separate lines for a proper crosshair with gap
    const halfSize = size / 2;
    // const halfGap = gap / 2;

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 999
        }}>
            {/* Top */}
            <div style={{ position: 'absolute', left: '50%', bottom: `${gap / 2}px`, width: `${thickness}px`, height: `${halfSize - gap / 2}px`, backgroundColor: color, transform: 'translateX(-50%)' }} />
            {/* Bottom */}
            <div style={{ position: 'absolute', left: '50%', top: `${gap / 2}px`, width: `${thickness}px`, height: `${halfSize - gap / 2}px`, backgroundColor: color, transform: 'translateX(-50%)' }} />
            {/* Left */}
            <div style={{ position: 'absolute', top: '50%', right: `${gap / 2}px`, width: `${halfSize - gap / 2}px`, height: `${thickness}px`, backgroundColor: color, transform: 'translateY(-50%)' }} />
            {/* Right */}
            <div style={{ position: 'absolute', top: '50%', left: `${gap / 2}px`, width: `${halfSize - gap / 2}px`, height: `${thickness}px`, backgroundColor: color, transform: 'translateY(-50%)' }} />

            {/* Center Dot (Optional) */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '2px', height: '2px', backgroundColor: color, transform: 'translate(-50%, -50%)', opacity: 0.8 }} />
        </div>
    );
}
