import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useDeviceDetect } from '../hooks/useDeviceDetect'

const PerformanceMonitor = () => {
    const { setDpr, gl } = useThree()
    const { isMobile } = useDeviceDetect()

    // REQ-044: Dynamic Resolution Scaling
    const frames = useRef(0)
    const time = useRef(0)
    const currentDpr = useRef(isMobile ? 1.5 : 2) // Start high-ish

    useEffect(() => {
        // Initial set
        setDpr(currentDpr.current)
    }, [])

    useFrame((_, dt) => {
        frames.current++
        time.current += dt

        if (time.current >= 1.0) {
            const fps = frames.current / time.current

            // Logic: Drop DPR if FPS < 30. Raise if FPS > 55 stable.
            // Hysteresis needed to avoid flickering resolution.

            if (fps < 30 && currentDpr.current > 1.0) {
                // Downgrade
                currentDpr.current = Math.max(1.0, currentDpr.current - 0.5)
                setDpr(currentDpr.current)
                console.log('Performance: Dropping DPR to', currentDpr.current)
            } else if (fps > 58 && currentDpr.current < (isMobile ? 2 : 2.5)) {
                // Upgrade
                // currentDpr.current = Math.min(isMobile ? 2 : 3, currentDpr.current + 0.1)
                // setDpr(currentDpr.current)
                // Upgrading is risky during gameplay, maybe only downgrade?
            }

            // Reset
            frames.current = 0
            time.current = 0
        }
    })

    return null
}

export default PerformanceMonitor
