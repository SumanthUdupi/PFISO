import React, { useEffect } from 'react'
import { useSoundBank } from './SoundBank'
import useAudioStore from '../../audioStore'
import * as THREE from 'three'

/**
 * GlobalAudio plays non-positional UI sounds. 
 * Since Three.js Audio needs a Listener, and our listener is on the camera,
 * we can technically use an Audio object attached to the camera or just a global Audio object.
 * However, R3F's <Audio /> component attaches to the scene graph.
 * For UI sounds, we might want to just use standard HTML5 Audio or connect to the main context output directly (non-spatial).
 */

// Simple hook to play one-shot global sounds
export const useGlobalAudio = () => {
    const { buffers } = useSoundBank()
    const { volume, muted } = useAudioStore()

    const play = (type: string) => {
        if (!buffers[type] || muted) return

        // We create a fleeting source for UI sounds
        // This bypasses the scene graph spatialization
        const ctx = buffers[type].context as AudioContext
        const source = ctx.createBufferSource()
        source.buffer = buffers[type]

        const gain = ctx.createGain()
        gain.gain.value = volume

        source.connect(gain)
        gain.connect(ctx.destination)
        source.start(0)
    }

    return play
}

// Component to handle UI/Event driven global sounds
const GlobalAudio = () => {
    // This could listen to global events to play 'success', 'error', etc.
    return null
}

export default GlobalAudio
