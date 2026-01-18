import { useState, useEffect } from 'react'

export const isMobileUserAgent = () => {
    const ua = navigator.userAgent
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isTouch = navigator.maxTouchPoints > 0
    // stricter check: must be mobile UA AND (touch OR small screen)
    return isMobileUA || (isTouch && window.innerWidth <= 768)
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
