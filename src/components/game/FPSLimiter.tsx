import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'

export const FPSLimiter = ({ limit = 30 }: { limit?: number }) => {
    // Destructure advance from useThree state
    const state = useThree()
    const { set, invalidate, gl, scene, camera, advance } = state
    const { isMobile } = useDeviceDetect()
    const lastInputTime = useRef(performance.now())
    const frameCount = useRef(0)
    const lastFpsCheck = useRef(performance.now())
    const currentDpr = useRef(gl.getPixelRatio())

    useEffect(() => {
        if (!isMobile) {
            set({ frameloop: 'always' })
            return
        }

        // Add event listeners to detect user interaction
        const handleInput = () => {
            lastInputTime.current = performance.now()
        }

        window.addEventListener('pointerdown', handleInput)
        window.addEventListener('pointermove', handleInput)
        window.addEventListener('touchstart', handleInput)
        window.addEventListener('keydown', handleInput)

        // Custom render loop
        set({ frameloop: 'never' })
        let lastRenderTime = 0

        const loop = () => {
            const now = performance.now()
            const timeSinceInput = now - lastInputTime.current

            // FPS calculation for DRS
            frameCount.current++
            if (now - lastFpsCheck.current >= 1000) {
                const fps = frameCount.current / ((now - lastFpsCheck.current) / 1000)
                frameCount.current = 0
                lastFpsCheck.current = now

                // Dynamic Resolution Scaling
                if (isMobile) {
                    let targetDpr = currentDpr.current
                    if (fps < 25) {
                        targetDpr = Math.max(0.5, currentDpr.current * 0.8) // Reduce resolution
                    } else if (fps > 50) {
                        targetDpr = Math.min(2, currentDpr.current * 1.1) // Increase resolution
                    }
                    if (Math.abs(targetDpr - currentDpr.current) > 0.1) {
                        currentDpr.current = targetDpr
                        gl.setPixelRatio(targetDpr)
                    }
                }
            }

            // If active input (within 3s), target 60fps
            // If idle, target 30fps
            const isIdle = timeSinceInput > 3000
            const targetInterval = isIdle ? 1000 / 30 : 0 // 0 means as fast as possible

            if (now - lastRenderTime >= targetInterval) {
                lastRenderTime = now
                // advance(now) processes useFrame hooks and renders the scene
                if (advance) {
                    advance(now)
                } else {
                    // Fallback for older versions if advance is not exposed (unlikely in v8)
                    invalidate()
                    gl.render(scene, camera)
                }
            }

            requestAnimationFrame(loop)
        }

        const rafId = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('pointerdown', handleInput)
            window.removeEventListener('pointermove', handleInput)
            window.removeEventListener('touchstart', handleInput)
            window.removeEventListener('keydown', handleInput)
            set({ frameloop: 'always' })
        }
    }, [isMobile, set, invalidate, gl, scene, camera, advance])

    return null
}
