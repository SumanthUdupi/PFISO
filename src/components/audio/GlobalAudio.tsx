import React, { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { resolveAssetPath } from '../../utils/assetUtils'
import { useSoundBank } from './SoundBank'
import useAudioStore from '../../audioStore'

/**
 * GlobalAudio plays non-positional UI sounds. 
 * Since Three.js Audio needs a Listener, and our listener is on the camera,
 * we can technically use an Audio object attached to the camera or just a global Audio object.
 * However, R3F's <Audio /> component attaches to the scene graph.
 * For UI sounds, we might want to just use standard HTML5 Audio or connect to the main context output directly (non-spatial).
 */

// Simple hook to play one-shot global sounds
export const useGlobalAudio = () => {
    const { buffers, listener } = useSoundBank()
    const { volume, muted } = useAudioStore()

    // SYS-046: Music Loop Gap
    // Using Howl's loop: true with html5: false (default) loads whole file for gapless.
    // However, if the file has silence at ends, it will gap.
    // Assuming file is trimmed.
    // To ensure gapless, we can double buffer or just rely on Web Audio API (which howler uses by default).
    const musicRef = useRef<Howl | null>(null);

    useEffect(() => {
        if (!musicRef.current) {
            musicRef.current = new Howl({
                src: [resolveAssetPath('audio/music_ambient_loop.mp3')],
                loop: true, // SYS-046: Seamless loop
                volume: 0.5,
                preload: true,
                html5: false, // Force Web Audio API for gapless (default, but explicit)
            });
        }
    }, []); // Empty dependency array ensures this runs once on mount

    const play = (type: string) => {
        if (!buffers[type] || !listener || muted) return

        // We create a fleeting source for UI sounds
        // This bypasses the scene graph spatialization
        const ctx = listener.context
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
