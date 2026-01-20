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

            // PERF-023: Profiler (Simple Graphy)
            const canvas = document.getElementById('perf-graph') as HTMLCanvasElement;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, 60, 30);
                    ctx.fillStyle = fps < 30 ? 'red' : 'green';
                    const height = Math.min(30, (fps / 60) * 30);
                    ctx.fillRect(0, 30 - height, 60, height);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px monospace';
                    ctx.fillText(Math.round(fps) + ' FPS', 2, 10);
                }
            } else {
                const c = document.createElement('canvas');
                c.id = 'perf-graph';
                c.width = 60;
                c.height = 30;
                c.style.position = 'fixed';
                c.style.top = '5px';
                c.style.left = '5px';
                c.style.zIndex = '9999';
                c.style.opacity = '0.7';
                document.body.appendChild(c);
            }

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
            }

            // Reset
            frames.current = 0
            time.current = 0
        }
    })

    return null
}

export default PerformanceMonitor
