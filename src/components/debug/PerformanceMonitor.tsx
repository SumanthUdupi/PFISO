import React, { useEffect, useRef, useState } from 'react'

declare global {
    interface Window {
        perf: {
            startSession: (name: string) => void
            stopSession: () => void
            getReports: () => any
            toggleOverlay: () => void
        }
    }
}

interface PerfSession {
    name: string
    startTime: number
    endTime: number
    frames: number
    minFps: number
    maxFps: number
    avgFps: number
    frameTimes: number[]
}

const PerformanceMonitor: React.FC = () => {
    const [visible, setVisible] = useState(false) // Hidden by default, agent can toggle or read implementation
    const [stats, setStats] = useState({ fps: 0, ms: 0 })

    const frameCount = useRef(0)
    const lastTime = useRef(performance.now())
    const lastFpsTime = useRef(performance.now())

    const currentSession = useRef<Partial<PerfSession> | null>(null)
    const sessions = useRef<PerfSession[]>([])

    const requestRef = useRef<number>()

    const animate = (time: number) => {
        frameCount.current++
        const delta = time - lastTime.current
        lastTime.current = time

        // Calculate FPS every second
        if (time - lastFpsTime.current >= 1000) {
            const fps = frameCount.current
            const ms = 1000 / fps

            setStats({ fps, ms })

            // Session recording
            if (currentSession.current) {
                const s = currentSession.current
                s.frames = (s.frames || 0) + fps // Accumulate frames? Actually just tracking samples
                const ft = s.frameTimes || []

                // This is coarse (per second). For finer grain we need per-frame logging
                // But for per-frame logging, we shouldn't do it inside the 1s block.

                s.minFps = Math.min(s.minFps ?? fps, fps)
                s.maxFps = Math.max(s.maxFps ?? fps, fps)
            }

            frameCount.current = 0
            lastFpsTime.current = time
        }

        // Per-frame recording for session
        if (currentSession.current) {
            if (!currentSession.current.frameTimes) currentSession.current.frameTimes = []
            currentSession.current.frameTimes.push(delta)
        }

        requestRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate)

        window.perf = {
            startSession: (name: string) => {
                console.log(`[Perf] Starting session: ${name}`)
                currentSession.current = {
                    name,
                    startTime: performance.now(),
                    frames: 0,
                    minFps: 999,
                    maxFps: 0,
                    frameTimes: []
                }
            },
            stopSession: () => {
                if (currentSession.current) {
                    const end = performance.now()
                    const s = currentSession.current
                    s.endTime = end

                    // Calculate final stats
                    const duration = (end - (s.startTime || 0)) / 1000
                    const frameTimes = s.frameTimes || []
                    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
                    const avgFps = 1000 / avgFrameTime

                    const report: PerfSession = {
                        name: s.name!,
                        startTime: s.startTime!,
                        endTime: end,
                        frames: frameTimes.length,
                        minFps: s.minFps!,
                        maxFps: s.maxFps!,
                        avgFps,
                        frameTimes: frameTimes // Keep raw data? Might be huge. Agent should ask for Summary.
                    }

                    sessions.current.push(report)
                    console.log(`[Perf] Session stopped:`, report)
                    currentSession.current = null
                }
            },
            getReports: () => sessions.current,
            toggleOverlay: () => setVisible(v => !v)
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [])

    if (!visible) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            background: 'rgba(0,0,0,0.8)',
            color: '#0f0',
            padding: '10px',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            <div>FPS: {stats.fps}</div>
            <div>Frame: {stats.ms.toFixed(2)}ms</div>
            <div>Session: {currentSession.current ? currentSession.current.name : 'Idle'}</div>
        </div>
    )
}

export default PerformanceMonitor
