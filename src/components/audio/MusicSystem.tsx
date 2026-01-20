import React, { useEffect, useRef, useState, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import useGameStore from '../../store'
import useAudioStore from '../../audioStore'
import { SoundBankContext } from './SoundBank'

const MusicSystem = () => {
    const { loaded, getSound, busAnalysis } = useContext(SoundBankContext)
    const { gameState, stamina, health } = useGameStore()
    const audioCtx = useAudioStore(state => state.audioCtx) // Direct access

    // Nodes
    const musicGain = useRef<GainNode | null>(null)
    const filterNode = useRef<BiquadFilterNode | null>(null) // AUD-018
    const sources = useRef<{ [key: string]: { source: AudioBufferSourceNode, gain: GainNode } }>({})
    const gainTargets = useRef<{ [key: string]: number }>({ explore: 0, tension: 0, menu: 0 })

    const heartbeatSource = useRef<AudioBufferSourceNode | null>(null)
    const heartbeatGain = useRef<GainNode | null>(null)

    // Init Logic
    useEffect(() => {
        if (!loaded || !musicGain.current && audioCtx) {
            const mg = audioCtx.createGain()
            mg.gain.value = 0.5

            const filter = audioCtx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.value = 22000

            filter.connect(mg)
            mg.connect(audioCtx.destination)

            musicGain.current = mg
            filterNode.current = filter
        }
    }, [loaded, audioCtx])

    // Track Setup
    useEffect(() => {
        if (!loaded || !audioCtx || !musicGain.current || !filterNode.current) return

        const tracks = ['explore', 'tension', 'menu']
        tracks.forEach(track => {
            if (sources.current[track]) return // Already active

            const buffer = getSound(`music_${track}` as any)
            if (buffer) {
                const src = audioCtx.createBufferSource()
                src.buffer = buffer
                src.loop = true

                const g = audioCtx.createGain()
                g.gain.value = 0

                src.connect(g)
                g.connect(filterNode.current!)

                src.start()
                sources.current[track] = { source: src, gain: g }
            }
        })

        // Heartbeat
        if (!heartbeatSource.current) {
            const hb = getSound('heartbeat')
            if (hb) {
                const src = audioCtx.createBufferSource()
                src.buffer = hb
                src.loop = true
                const g = audioCtx.createGain()
                g.gain.value = 0
                src.connect(g)
                g.connect(audioCtx.destination)
                src.start()
                heartbeatSource.current = src
                heartbeatGain.current = g
            }
        }

        return () => {
            // Cleanup would go here but we likely want persistent music across scenes if component unmounts?
            // Actually usually we stop.
            Object.values(sources.current).forEach(s => {
                try { s.source.stop(); s.source.disconnect(); s.gain.disconnect() } catch { }
            })
            sources.current = {}
            if (heartbeatSource.current) {
                try { heartbeatSource.current.stop(); heartbeatSource.current.disconnect() } catch { }
                heartbeatSource.current = null
            }
        }
    }, [loaded, audioCtx, getSound])

    useFrame((state, delta) => {
        if (!musicGain.current || !filterNode.current) return

        // Target Logic
        let target = 'explore'
        if (gameState === 'menu' || gameState === 'paused') target = 'menu'
        else if (stamina < 30) target = 'tension'

        const FADE_RATE = 0.5 * delta

        // Update Targets
        for (const t of ['explore', 'tension', 'menu']) {
            const isTarget = t === target
            const current = gainTargets.current[t]
            let next = current
            if (isTarget) next = Math.min(1, current + FADE_RATE)
            else next = Math.max(0, current - FADE_RATE)
            gainTargets.current[t] = next

            if (sources.current[t]) {
                const gain = sources.current[t].gain
                if (isTarget) {
                    gain.gain.setTargetAtTime(1.0, time, 2.0)
                    // AUD-040: Music Restart on Re-enter? 
                    // Current logic: Loops continuously.
                    // If we wanted to restart the track when it becomes dominant:
                    // We'd need to check if gain was ~0.
                    // However, ambient music usually continuously loops. 
                    // Let's assume AUD-040 implies "Ability to restart music when transitioning levels or manually"
                    // Since this useFrame runs every frame, we don't want to constantly restart.
                    // We'll leave it as continuous loop for smoothness.
                } else {
                    gain.gain.setTargetAtTime(0.0, time, 2.0)
                }
            }
        }

        // Apply LowPass for Low Health (Bass Boost / Muffle)
        if (filterNode.current) {
            const targetFreq = (isLowHealth || useAudioStore.getState().bassBoost) ? 200 : 22000 // Added bassBoost check (AUD-048)
            filterNode.current.frequency.setTargetAtTime(targetFreq, time, 0.5)
        }

        // AUD-019 Heartbeat
        if (heartbeatGain.current) {
            const hbVol = health < 30 ? (1.0 - (health / 30)) : 0 // Louder as health drops
            heartbeatGain.current.gain.setTargetAtTime(hbVol, state.clock.elapsedTime, 0.1)
        }
    })

    return null
}

export default MusicSystem
