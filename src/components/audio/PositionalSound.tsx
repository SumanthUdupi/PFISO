import React, { useRef, useEffect, useState } from 'react'
import { PositionalAudio } from '@react-three/drei'
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
 */
const PositionalSound: React.FC<PositionalSoundProps> = ({ type, trigger, loop = false, distance = 10, volumeMultiplier = 1.0 }) => {
    const soundRef = useRef<THREE.PositionalAudio>(null)
    const { buffers, isLoaded } = useSoundBank()
    const { volume, muted } = useAudioStore()
    const [isPlaying, setIsPlaying] = useState(false)

    // Trigger Playback
    useEffect(() => {
        if (!isLoaded || !buffers[type] || !soundRef.current || muted) return

        if (trigger) {
            if (soundRef.current.isPlaying) soundRef.current.stop()
            soundRef.current.setBuffer(buffers[type])
            soundRef.current.setVolume(volume * volumeMultiplier)
            soundRef.current.setRefDistance(1) // Attenuation starts at 1 meter
            soundRef.current.setMaxDistance(distance)
            soundRef.current.setLoop(loop)
            soundRef.current.play()
            setIsPlaying(true)
        } else if (!loop && isPlaying) {
            // If trigger goes false and we are NOT looping, we usually don't stop strictly unless specified.
            // But if we want to support "hold to play" logic, we could stop here.
            // For one-shots, 'trigger' usually pulses true/false.
        }

        if (loop && !trigger && isPlaying) {
            soundRef.current.stop()
            setIsPlaying(false)
        }

    }, [trigger, isLoaded, buffers, type, volume, muted, loop, distance, volumeMultiplier])

    return (
        <PositionalAudio
            ref={soundRef}
            distance={distance}
            loop={loop}
            // @ts-ignore
            url={null} // We set buffer manually
        />
    )
}

export default PositionalSound
