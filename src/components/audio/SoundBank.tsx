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
}

const SoundBankContext = createContext<SoundBankContextValue>({
    listener: null,
    buffers: {},
    isLoaded: false,
})

export const useSoundBank = () => useContext(SoundBankContext)

// CS-031: Hybrid Listener Position logic in a component
const ListenerUpdater = ({ listener }: { listener: AudioListener }) => {
    const { camera } = useThree()

    useFrame((state, delta) => {
        const pPos = gameSystemInstance.playerPosition
        if (pPos) {
            const playerVec = new THREE.Vector3(pPos.x, pPos.y, pPos.z)
            // Lerp between camera and player (Hybrid position)
            const target = new THREE.Vector3().lerpVectors(camera.position, playerVec, 0.5)
            listener.position.lerp(target, delta * 5)
            listener.rotation.copy(camera.rotation)
        } else {
            // Fallback to camera
            listener.position.copy(camera.position)
            listener.rotation.copy(camera.rotation)
        }
        listener.updateMatrixWorld()
    })
    return null
}

export const SoundBankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { camera } = useThree()
    const [listener] = useState(() => new AudioListener())
    const [buffers, setBuffers] = useState<Record<string, AudioBuffer>>({})
    const [isLoaded, setIsLoaded] = useState(false)
    const initialized = useRef(false)

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
            const types: SoundType[] = ['hover', 'click', 'unlock', 'error', 'jump', 'land', 'open_modal', 'teleport', 'success']
            const newBuffers: Record<string, AudioBuffer> = {}

            // Generate procedural buffers
            await Promise.all(types.map(async (type) => {
                const buffer = await generateSoundBuffer(type)
                if (buffer) {
                    newBuffers[type] = buffer
                }
            }))

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

    return (
        <SoundBankContext.Provider value={{ listener, buffers, isLoaded }}>
            {/* ListenerUpdater handles position updates */}
            <ListenerUpdater listener={listener} />
            {children}
        </SoundBankContext.Provider>
    )
}
