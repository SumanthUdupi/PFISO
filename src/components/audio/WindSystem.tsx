import React, { useEffect, useRef } from 'react'
import { useSoundBank } from './SoundBank'
import useAudioStore from '../../audioStore'
import { useFrame } from '@react-three/fiber'
import gameSystemInstance from '../../systems/GameSystem'

const WindSystem: React.FC = () => {
    const { buffers, isLoaded, listener, buses } = useSoundBank()
    const { volume, muted } = useAudioStore()
    const soundRef = useRef<{ source: AudioBufferSourceNode, gain: GainNode } | null>(null)

    // logic: volume varies by height
    useFrame(() => {
        if (!soundRef.current || muted) return

        const playerPos = gameSystemInstance.playerPosition
        if (!playerPos) return

        // Map Height 0..30 to Volume 0..0.4
        // Base volume is low (0.05)
        const baseVol = 0.05
        const heightVol = Math.max(0, Math.min(1, (playerPos.y - 2) / 20)) * 0.35

        const targetVol = (baseVol + heightVol) * volume

        soundRef.current.gain.gain.setTargetAtTime(targetVol, listener!.context.currentTime, 0.5)
    })

    useEffect(() => {
        if (!isLoaded || !buffers['ambient_wind'] || !listener || !buses.sfx) return

        const ctx = listener.context
        const source = ctx.createBufferSource()
        source.buffer = buffers['ambient_wind']
        source.loop = true

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0, ctx.currentTime)

        // Connect to SFX bus (which handles Ducking)
        source.connect(gain)
        gain.connect(buses.sfx)

        source.start()

        soundRef.current = { source, gain }

        return () => {
            source.stop()
            source.disconnect()
            gain.disconnect()
            soundRef.current = null
        }
    }, [isLoaded, buffers, listener, buses])

    return null
}

export default WindSystem
