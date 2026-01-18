import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import gameSystemInstance from './GameSystem'
import { trackPosition } from '../utils/analytics'

const PING_INTERVAL = 5000 // 5 seconds

const REPLAY_BUFFER_SIZE = 600 // ~10 seconds at 60fps

export const TelemetryManager = () => {
    const lastPingTime = useRef(0)

    // REQ-048: Replay System Data Recording
    const replayBuffer = useRef<{ t: number, pos: [number, number, number], rot: [number, number, number] }[]>([])

    // We need access to camera for recording
    const { camera } = useThree()

    useFrame(() => {
        const now = Date.now()

        // Record Frame
        const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z]
        const rot: [number, number, number] = [camera.rotation.x, camera.rotation.y, camera.rotation.z]

        replayBuffer.current.push({ t: now, pos, rot })

        // Maintain buffer size
        if (replayBuffer.current.length > REPLAY_BUFFER_SIZE) {
            replayBuffer.current.shift()
        }
    })

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()
            if (now - lastPingTime.current >= PING_INTERVAL) {
                const pos = gameSystemInstance.playerPosition
                if (pos) {
                    trackPosition(pos.x, pos.y, pos.z)
                    lastPingTime.current = now
                }
            }
        }, PING_INTERVAL)

        return () => clearInterval(interval)
    }, [])

    // Expose buffer for debug/replay tools (optional)
    // (window as any).__replayBuffer = replayBuffer

    return null
}
