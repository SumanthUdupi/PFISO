import React from 'react'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'

const PortraitWarning: React.FC = () => {
    // Use the central hook for consistency
    const { isLandscape, isMobile } = useDeviceDetect()

    // Only show warning if:
    // 1. We are on a mobile device (UA check or touch + small screen)
    // 2. AND we are NOT in landscape
    // This prevents it from showing on desktop windows that are just tall
    const showWarning = isMobile && !isLandscape

    if (!showWarning) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-cozy-bg flex flex-col items-center justify-center text-cozy-text p-8 text-center">
            <div className="text-6xl mb-8 animate-bounce opacity-80">📱</div>
            <h2 className="text-3xl font-bold font-sans mb-4 text-cozy-text">Best Viewed in Landscape</h2>
            <p className="font-sans text-cozy-text/70 max-w-xs text-lg">
                For the best experience, please rotate your device.
                <br />
                <span className="text-sm mt-2 block text-cozy-text/50">(It's much cozier that way!)</span>
            </p>
        </div>
    )

}

export default PortraitWarning
