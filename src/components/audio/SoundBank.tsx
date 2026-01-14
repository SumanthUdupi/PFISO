import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { AudioListener, AudioLoader } from 'three'
import { useThree, useLoader } from '@react-three/fiber'
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

        const loadSounds = async () => {
            const types: SoundType[] = ['hover', 'click', 'unlock', 'error', 'jump', 'land', 'open_modal', 'teleport', 'success']
            const newBuffers: Record<string, AudioBuffer> = {}

            // Generate all buffers in parallel
            await Promise.all(types.map(async (type) => {
                const buffer = await generateSoundBuffer(type)
                if (buffer) {
                    newBuffers[type] = buffer
                }
            }))

            setBuffers(newBuffers)
            setIsLoaded(true)
            console.log("🔊 SoundBank: All procedural sounds generated.")
        }

        loadSounds()
    }, [])

    return (
        <SoundBankContext.Provider value={{ listener, buffers, isLoaded }}>
            {children}
        </SoundBankContext.Provider>
    )
}
