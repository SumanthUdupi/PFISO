import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { AudioListener } from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gameSystemInstance from '../../systems/GameSystem'
import { generateSoundBuffer, SoundType } from '../../utils/audioGen'

interface SoundBankContextValue {
    listener: AudioListener | null
    buffers: Record<string, AudioBuffer>
    isLoaded: boolean
    buses: { sfx: GainNode | null, music: GainNode | null, voice: GainNode | null }
    play: (name: string, bus?: 'sfx' | 'music' | 'voice', volume?: number, loop?: boolean) => AudioBufferSourceNode | null
    getSound: (name: string) => AudioBuffer | null
    busAnalysis: { sfx: AnalyserNode | null, music: AnalyserNode | null, voice: AnalyserNode | null } // Added busAnalysis
}

export const SoundBankContext = createContext<SoundBankContextValue>({
    listener: null,
    buffers: {},
    isLoaded: false,
    buses: { sfx: null, music: null, voice: null },
    play: () => null, // Default no-op function
    getSound: () => null, // Default no-op function
    busAnalysis: { sfx: null, music: null, voice: null } // Default empty busAnalysis
})

import useAudioStore from '../../audioStore'

// CS-031: Hybrid Listener Position logic in a component
// ...

export const useSoundBank = () => useContext(SoundBankContext)

// AUD-006: Ducking Logic Component
const DuckingManager = ({ buses }: { buses: { sfx: GainNode | null, music: GainNode | null, voice: GainNode | null } }) => {
    const activeDialogueCount = useAudioStore(state => state.activeDialogueCount)

    useEffect(() => {
        const { music, sfx } = buses
        if (!music || !sfx) return

        const now = music.context.currentTime
        const timeConstant = 0.5

        if (activeDialogueCount > 0) {
            // Duck Volume
            music.gain.setTargetAtTime(0.2, now, timeConstant)
            sfx.gain.setTargetAtTime(0.4, now, timeConstant)
        } else {
            // Restore Volume
            music.gain.setTargetAtTime(1.0, now, timeConstant)
            sfx.gain.setTargetAtTime(1.0, now, timeConstant)
        }
    }, [activeDialogueCount, buses])

    return null
}

const ListenerUpdater = ({ listener }: { listener: AudioListener }) => {
    const { camera } = useThree()
    const filterRef = useRef<BiquadFilterNode | null>(null)

    useEffect(() => {
        if (!listener || filterRef.current) return
        // AUD-030: Master Underwater Filter
        // We act on the listener's input directly if possible, or assume listener is final stage?
        // Actually AudioListener usually has its own gain. We can insert a filter.
        // But THREE.AudioListener doesn't easily expose an insert point before destination except getInput() which sounds connect TO.
        // So we can filter the *destination*? No.
        // Correct way: Connect global Gain to Filter to Context.Destination?
        // ThreeJS connects listener.gain to context.destination.
        // We can inject: listener.gain.disconnect(); listener.gain.connect(filter); filter.connect(context.destination);

        const ctx = listener.context
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 22000

        const masterGain = listener.gain
        masterGain.disconnect()
        masterGain.connect(filter)
        filter.connect(ctx.destination)

        filterRef.current = filter

        return () => {
            masterGain.disconnect()
            masterGain.connect(ctx.destination)
        }
    }, [listener])

    useFrame((state, delta) => {
        const pPos = gameSystemInstance.playerPosition
        if (pPos) {
            const playerVec = new THREE.Vector3(pPos.x, pPos.y, pPos.z)
            const target = new THREE.Vector3().lerpVectors(camera.position, playerVec, 0.5)
            listener.position.lerp(target, delta * 5)
            listener.rotation.copy(camera.rotation)
        } else {
            listener.position.copy(camera.position)
            listener.rotation.copy(camera.rotation)
        }
        listener.updateMatrixWorld()

        // Check Water Level (y < -1 roughly)
        if (filterRef.current) {
            const isUnderwater = camera.position.y < -1.0
            const targetFreq = isUnderwater ? 300 : 22000
            filterRef.current.frequency.setTargetAtTime(targetFreq, state.clock.elapsedTime, 0.5)
        }
    })
    return null
}

export const SoundBankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { camera } = useThree()
    const [listener] = useState(() => new AudioListener())
    const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({})
    const [isLoaded, setIsLoaded] = useState(false)
    const initialized = useRef(false)

    // Buses
    const [buses, setBuses] = useState<{ sfx: GainNode | null, music: GainNode | null, voice: GainNode | null }>({
        sfx: null, music: null, voice: null
    })

    // Create Buses
    useEffect(() => {
        if (!listener) return
        const ctx = listener.context

        const sfx = ctx.createGain()
        const music = ctx.createGain()
        const voice = ctx.createGain()

        // Connect to Listener (Master)
        const masterInput = listener.getInput()
        sfx.connect(masterInput)
        music.connect(masterInput)

        // AUD-029: Voice Delay (Slapback Echo for radio effect)
        const voiceDelay = ctx.createDelay()
        voiceDelay.delayTime.value = 0.15 // 150ms
        const voiceFeedback = ctx.createGain()
        voiceFeedback.gain.value = 0.2
        const voiceFilter = ctx.createBiquadFilter()
        voiceFilter.type = 'highpass'
        voiceFilter.frequency.value = 500 // Radio thinness

        // Path: Voice -> Filter -> Master
        //           -> Delay -> Feedback -> Delay -> Master

        voice.connect(voiceFilter)
        voiceFilter.connect(masterInput)

        voiceFilter.connect(voiceDelay)
        voiceDelay.connect(voiceFeedback)
        voiceFeedback.connect(voiceDelay)
        voiceDelay.connect(masterInput)


        setBuses({ sfx, music, voice })

        return () => {
            sfx.disconnect()
            music.disconnect()
            voice.disconnect()
        }
    }, [listener])

    // 2. Generate Buffers on Mount
    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        // Handle Audio Context Resume
        const handleUserInteraction = () => {
            if (listener && listener.context.state === 'suspended') {
                listener.context.resume().then(() => {
                    console.log("🔊 AudioContext Resumed")
                })
            }
        }

        window.addEventListener('click', handleUserInteraction)
        window.addEventListener('keydown', handleUserInteraction)
        window.addEventListener('touchstart', handleUserInteraction)

        return () => {
            window.removeEventListener('click', handleUserInteraction)
            window.removeEventListener('keydown', handleUserInteraction)
            window.removeEventListener('touchstart', handleUserInteraction)
        }
    }, [listener])

    // Load Sounds
    useEffect(() => {
        if (isLoaded) return

        const loadSounds = async () => {
            const types: SoundType[] = [
                'footstep_concrete', 'footstep_wood', 'footstep_metal',
                'jump', 'land', 'ui_hover', 'ui_click',
                'ambient_office', 'ambient_hallway', 'ambient_wind',
                'music_explore', 'music_tension', 'music_menu', 'heartbeat',
                'crackle', 'breath_heavy', 'ambient_water', 'splash_enter', 'splash_exit',
                'pickup', 'rain', 'ping', 'birdsong',
                'bullet_casing', 'elevator_ding', 'page_turn', 'focus_enter', 'focus_exit'
            ]
            const newBuffers: Record<string, AudioBuffer> = {}

            // Generate procedural buffers
            await Promise.all(types.map(async (type) => {
                const buffer = await generateSoundBuffer(type)
                if (buffer) {
                    newBuffers[type] = buffer
                }
            }))

            // Generate Reverb Impulse
            const reverbBuffer = await generateImpulseResponse(2.0, 2.0)
            if (reverbBuffer) {
                newBuffers['impulse_hallway'] = reverbBuffer
            }

            // Load audio files
            const memoryIds = ['mem-work-1', 'mem-proj-1', 'mem-skill-1', 'mem-contact-1']
            await Promise.all(memoryIds.map(async (id) => {
                let buffer: AudioBuffer | null = null;
                try {
                    // Fix: Using relative path if import.meta not working, but sticking to existing pattern
                    const response = await fetch(`./assets/audio/${id}.mp3`)
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer()
                        if (arrayBuffer.byteLength > 100) {
                            buffer = await listener.context.decodeAudioData(arrayBuffer)
                            newBuffers[id] = buffer
                        }
                    }
                } catch (e) {
                    // Silent fallback
                }

                if (!newBuffers[id]) {
                    const fallback = await generateSoundBuffer('unlock')
                    if (fallback) newBuffers[id] = fallback
                }
            }))

            setBuffers(newBuffers)
            setIsLoaded(true)
            console.log("🔊 SoundBank: All sounds loaded.")
        }

        loadSounds()
    }, [listener, isLoaded])

    // PERF-015: Audio Mixer & Voice Limiting
    const activeVoices = useRef<AudioBufferSourceNode[]>([])
    const MAX_VOICES = 12 // Limit concurrent sounds

    const play = (name: string, busName: 'sfx' | 'music' | 'voice' = 'sfx', volume = 1.0, loop = false) => {
        if (!buffers[name] || !listener) return null
        // Ensure context is running
        if (listener.context.state === 'suspended') {
            listener.context.resume().catch(() => { })
        }

        // Voice Stealing
        // If we exceed max voices, stop the oldest one
        // Ideally we prioritize meaningful sounds (voice/music) over sfx
        // But for simplicity, we just cap total voices or maybe just sfx
        if (busName === 'sfx') {
            if (activeVoices.current.length >= MAX_VOICES) {
                const oldest = activeVoices.current.shift()
                try { oldest?.stop() } catch (e) { }
            }
        }

        const ctx = listener.context
        const source = ctx.createBufferSource()
        source.buffer = buffers[name]
        source.loop = loop

        // Gain for specific volume
        const gainNode = ctx.createGain()
        gainNode.gain.value = volume

        source.connect(gainNode)

        // Connect to Bus
        const targetBus = buses[busName]
        if (targetBus) {
            gainNode.connect(targetBus)
        } else {
            // Fallback
            gainNode.connect(listener.getInput())
        }

        source.start(0)

        if (busName === 'sfx') {
            activeVoices.current.push(source)
            source.onended = () => {
                activeVoices.current = activeVoices.current.filter(s => s !== source)
            }
        }

        return source
    }

    const getSound = (name: string) => buffers[name] || null

    return (
        <SoundBankContext.Provider value={{ listener, buffers, isLoaded, buses, play, getSound, busAnalysis: { sfx: null, music: null, voice: null } }}>
            {/* ListenerUpdater handles position updates */}
            <ListenerUpdater listener={listener} />
            <DuckingManager buses={buses} />
            {children}
        </SoundBankContext.Provider>
    )
}
