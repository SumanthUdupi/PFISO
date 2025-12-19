import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const FPSLimiter = ({ limit = 30 }: { limit?: number }) => {
    const { set, gl, scene, camera } = useThree()
    const lastRender = useRef(0)

    useEffect(() => {
        if (isMobile()) {
            // Take over the render loop
            set({ frameloop: 'never' })

            const loop = (time: number) => {
                requestAnimationFrame(loop)
                const now = performance.now() / 1000
                if (now - lastRender.current >= 1 / limit) {
                    lastRender.current = now
                    gl.render(scene, camera)
                }
            }
            const raf = requestAnimationFrame(loop)
            return () => cancelAnimationFrame(raf)
        }
    }, [limit, gl, scene, camera, set])

    return null
}
