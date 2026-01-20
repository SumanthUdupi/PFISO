import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier, RapierRigidBody } from '@react-three/rapier'
import useAudioStore from '../../audioStore'
import { useSoundBank } from './SoundBank'
import useGameStore from '../../store'

interface FootstepSystemProps {
    rigidBodyRef: React.RefObject<RapierRigidBody>
    isGrounded: React.MutableRefObject<boolean>
}

/**
 * FootstepSystem
 * Handles playing footstep sounds based on player movement and surface type.
 * Should be a child of the Player or placed where it can access the rigidBody.
 */
const FootstepSystem: React.FC<FootstepSystemProps> = ({ rigidBodyRef, isGrounded }) => {
    const { world } = useRapier()
    const { buffers, isLoaded, listener } = useSoundBank()
    const isMuted = useAudioStore(state => state.muted)
    const setVolume = useAudioStore(state => state.setVolume)

    // State to track distance for steps
    const lastPos = useRef(new THREE.Vector3())
    const distanceAccumulator = useRef(0)
    const STEP_DISTANCE = 2.0 // Meters between steps (adjust for walk/run)
    const SPRINT_STEP_DISTANCE = 2.5

    // Audio Source for footsteps (we'll reuse one or create on fly? 
    // Ideally we use a pool, but for now we create a temporary Audio source or use PositionalAudio)
    // Since footsteps are AT the player, 2D or 3D at player pos is fine. 
    // 2D is often clearer for player's own feet, but 3D with low rolloff works too.
    // We'll use the listener's context to play 2D sounds for "self" to avoid weird panning when turning head.

    useFrame((state, delta) => {
        if (!rigidBodyRef.current || !isLoaded || isMuted || !isGrounded.current) return

        const pos = rigidBodyRef.current.translation()
        const currentPos = new THREE.Vector3(pos.x, pos.y, pos.z)

        // Calculate distance moved
        // Ignore Y movement for steps mostly
        const dist = new THREE.Vector2(currentPos.x - lastPos.current.x, currentPos.z - lastPos.current.z).length()

        if (dist > 0.01) { // Moving
            // Check sprint state from store or inferred speed
            // If speed > 6, sprint
            const speed = dist / delta
            const stepThreshold = speed > 10 ? SPRINT_STEP_DISTANCE : STEP_DISTANCE

            distanceAccumulator.current += dist

            if (distanceAccumulator.current >= stepThreshold) {
                distanceAccumulator.current = 0
                triggerFootstep(currentPos)
            }
        }

        lastPos.current.copy(currentPos)
    })

    const triggerFootstep = (position: THREE.Vector3) => {
        if (!listener) return

        // 1. Raycast down to find surface
        // Start slightly above feet
        const rayOrigin = { x: position.x, y: position.y + 0.5, z: position.z }
        const rayDir = { x: 0, y: -1, z: 0 }
        const hit = world.castRay(new (window as any).RAPIER.Ray(rayOrigin, rayDir), 1.0, true)

        let surfaceType = 'default'

        if (hit) {
            // Try to deduce material from collider or userData
            // This relies on how the world is built. 
            // For now, we'll randomize or default, or check if we can access the collider's parent user data.
            // Since we don't have easy access to the exact mesh userData via Rapier hit without referencing the store/scene map, 
            // we will use a workaround or Placeholder:
            // If Y > 0.1 assume Wood (Platform), else Concrete, etc.

            // Placeholder Logic for Material (AUD-001)
            // Ideally: const mat = hit.collider.parent().userData.material
            // We'll stick to 'footstep_default' unless we add specific tags later.
            // We can randomly choose texture for variety too.

            // Let's implement randomness at least:
            surfaceType = 'concrete'
        }

        // Map surface to sound type
        // 'footstep_default', 'footstep_carpet', 'footstep_tile', 'footstep_wood', 'footstep_concrete'
        const typeKey = `footstep_${surfaceType}` as any
        const buffer = buffers[typeKey] || buffers['footstep_default']

        if (buffer) {
            playBuffer(buffer)
        }
    }

    const playBuffer = (buffer: AudioBuffer) => {
        if (!listener) return
        const ctx = listener.context

        const source = ctx.createBufferSource()
        source.buffer = buffer

        // Pitch variation (0.9 - 1.1)
        source.playbackRate.value = 0.9 + Math.random() * 0.2

        // Volume variation
        const gainNode = ctx.createGain()
        const vol = useAudioStore.getState().volume
        const velocity = rigidBodyRef.current?.linvel()
        const speed = velocity ? Math.sqrt(velocity.x ** 2 + velocity.z ** 2) : 0
        // Louder if running
        const velocityVol = Math.min(Math.max(speed / 10.0, 0.3), 1.0)

        gainNode.gain.value = vol * velocityVol * 0.5 // Base volume scale

        source.connect(gainNode)
        gainNode.connect(ctx.destination) // 2D Sound for player footsteps

        source.start()
    }

    return null
}

export default FootstepSystem
