import { useState, useEffect } from 'react';

interface DeviceOrientation {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
}

export const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState<DeviceOrientation>({
        alpha: null,
        beta: null,
        gamma: null,
    });

    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            setOrientation({
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
            });
        };

        // Check if API is available
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            if (window.DeviceOrientationEvent) {
                window.removeEventListener('deviceorientation', handleOrientation);
            }
        };
    }, []);

    return orientation;
};
