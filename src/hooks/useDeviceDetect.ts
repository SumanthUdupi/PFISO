import { useState, useEffect } from 'react'

export const isMobileUserAgent = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const useDeviceDetect = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [isLandscape, setIsLandscape] = useState(true)

    useEffect(() => {
        const checkDevice = () => {
            const mobile = isMobileUserAgent()
            const landscape = window.innerWidth > window.innerHeight
            setIsMobile(mobile)
            setIsLandscape(landscape)
        }

        checkDevice()
        window.addEventListener('resize', checkDevice)
        return () => window.removeEventListener('resize', checkDevice)
    }, [])

    return {
        isMobile,
        isLandscape,
        deviceTier: isMobile ? 'low' : 'high' // Simplified tiering
    }
}
