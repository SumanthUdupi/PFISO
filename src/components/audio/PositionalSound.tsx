import React, { useEffect, useState, useMemo } from 'react'
import * as THREE from 'three'
import { useSoundBank } from './SoundBank'
import useAudioStore from '../../audioStore'

interface PositionalSoundProps {
    type: string // e.g. 'jump', 'machinery'
    trigger?: boolean // Set to true to play one-shot, or toggle for looping
    loop?: boolean
    distance?: number
    volumeMultiplier?: number
}

/**
 * A wrapper around THREE.PositionalAudio that uses our pre-generated buffers.
 * We avoid Drei's PositionalAudio to have full manual control over buffers and listeners.
 */
const PositionalSound: React.FC<PositionalSoundProps> = ({ type, trigger, loop = false, distance = 10, volumeMultiplier = 1.0 }) => {
    const { buffers, isLoaded, listener } = useSoundBank()
    const { volume, muted } = useAudioStore()
    const [isPlaying, setIsPlaying] = useState(false)

    // Create the sound object only when listener is available
    const sound = useMemo(() => {
        if (!listener) return null
        return new THREE.PositionalAudio(listener)
    }, [listener])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sound && sound.isPlaying) sound.stop()
        }
    }, [sound])

    // Trigger Playback
    useEffect(() => {
        if (!isLoaded || !buffers[type] || !sound || muted) return

        // Update settings
        sound.setRefDistance(1)
        sound.setMaxDistance(distance)
        sound.setLoop(loop)

        // This is important: setBuffer(buffer)
        // If buffer changes, we set it.
        // We only need to set it once really, but if type changes...
        if (sound.buffer !== buffers[type]) {
            sound.setBuffer(buffers[type])
        }

        if (trigger) {
            if (sound.isPlaying) sound.stop()
            sound.setVolume(volume * volumeMultiplier)
            sound.play()
            setIsPlaying(true)
        } else if (!loop && isPlaying) {
            // Optional: Stop if trigger goes false?
        }

        if (loop && !trigger && isPlaying) {
            sound.stop()
            setIsPlaying(false)
        }

    }, [trigger, isLoaded, buffers, type, volume, muted, loop, distance, volumeMultiplier, sound])

    if (!sound) return null

    return <primitive object={sound} />
}

export default PositionalSound
