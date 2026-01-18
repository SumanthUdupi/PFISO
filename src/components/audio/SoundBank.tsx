import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { AudioListener } from 'three'
import { useThree } from '@react-three/fiber'
import { generateSoundBuffer, SoundType } from '../../utils/audioGen'

interface SoundBankContextValue {
    listener: AudioListener | null
    buffers: Record<string, AudioBuffer>
    isLoaded: boolean
}

const SoundBankContext = createContext<SoundBankContextValue>({
    listener: null,
    buffers: {},
    isLoaded: false,
})

export const useSoundBank = () => useContext(SoundBankContext)

export const SoundBankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { camera } = useThree()
    const [listener] = useState(() => new AudioListener())
    const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({})
    const [isLoaded, setIsLoaded] = useState(false)
    const initialized = useRef(false)

    // 1. Attach Listener to Camera
    useEffect(() => {
        if (camera) {
            camera.add(listener)
            return () => {
                camera.remove(listener)
            }
        }
    }, [camera, listener])

    // 2. Generate Buffers on Mount
    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        // Handle Audio Context Resume (Autoplay Policy)
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
            // Cleanup (though this runs once usually)
            window.removeEventListener('click', handleUserInteraction)
            window.removeEventListener('keydown', handleUserInteraction)
            window.removeEventListener('touchstart', handleUserInteraction)
        }
    }, [listener])

    // Load Sounds
    useEffect(() => {
        if (isLoaded) return

        const loadSounds = async () => {
            const types: SoundType[] = ['hover', 'click', 'unlock', 'error', 'jump', 'land', 'open_modal', 'teleport', 'success']
            const newBuffers: Record<string, AudioBuffer> = {}

            // Generate procedural buffers in parallel
            await Promise.all(types.map(async (type) => {
                const buffer = await generateSoundBuffer(type)
                if (buffer) {
                    newBuffers[type] = buffer
                }
            }))

            // Load audio files for memory logs
            const memoryIds = ['mem-work-1', 'mem-proj-1', 'mem-skill-1', 'mem-contact-1']
            await Promise.all(memoryIds.map(async (id) => {
                let buffer: AudioBuffer | null = null;
                try {
                    const response = await fetch(`${import.meta.env.BASE_URL}assets/audio/${id}.mp3`)
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer()
                        if (arrayBuffer.byteLength > 100) { // arbitrary small size check
                            buffer = await listener.context.decodeAudioData(arrayBuffer)
                            newBuffers[id] = buffer
                        }
                    }
                } catch (e) {
                    // Silent fallback
                }

                if (!newBuffers[id]) {
                    // Fallback to procedural sound
                    const fallback = await generateSoundBuffer('unlock')
                    if (fallback) newBuffers[id] = fallback
                }
            }))

            setBuffers(newBuffers)
            setIsLoaded(true)
            console.log("🔊 SoundBank: All sounds loaded.")
        }

        loadSounds()
    }, [listener])

    return (
        <SoundBankContext.Provider value={{ listener, buffers, isLoaded }}>
            {children}
        </SoundBankContext.Provider>
    )
}
