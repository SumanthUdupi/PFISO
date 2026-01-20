import React, { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSoundBank } from './SoundBank'
import useGameStore from '../../store'

interface ReverbZoneProps {
    position: [number, number, number]
    size: [number, number, number] // Box size
    impulseId?: string
}

/**
 * ReverbZone (AUD-004)
 * Applies a convolution reverb when the player is inside the zone.
 * Since Three.js AudioListener doesn't have a global "main mix" easily accessible for inserts 
 * without modifying the graph, we will hack it or use a global ConvolverNode attached to listener input.
 * 
 * Ideally: Sound -> Panner -> Convolver -> Destination
 * But usually Sound -> Panner -> Destination.
 * 
 * Strategy: We can't easily re-route ALL operational sounds.
 * Alternative: We play a "Room Tone" that is reverbed? No.
 * Alternative 2: We use a wrapper for sounds that connects them to a "EnvironmentNode".
 * 
 * For this simplified implementation (since we can't easily refactor all sound sources):
 * We will just log "Entered Reverb Zone" and maybe set a global "reverbAmount" in audioStore that 
 * PositionalSound can read to connect to a secondary output.
 * 
 * IMPROVED STRATEGY:
 * We will assume PositionalSound checks `useAudioStore.reverbNode`.
 * But `reverbNode` needs to be created.
 */
const ReverbZone: React.FC<ReverbZoneProps> = ({ position, size, impulseId = 'impulse_hallway' }) => {
    const { listener, buffers } = useSoundBank()
    const playerPos = useGameStore(state => state.playerPosition)
    const [isActive, setIsActive] = React.useState(false)
    const convolverRef = useRef<ConvolverNode | null>(null)
    const dryGainRef = useRef<GainNode | null>(null)
    const wetGainRef = useRef<GainNode | null>(null)

    // Check bounds
    useFrame(() => {
        if (!playerPos) return
        const minX = position[0] - size[0] / 2
        const maxX = position[0] + size[0] / 2
        const minZ = position[2] - size[2] / 2
        const maxZ = position[2] + size[2] / 2

        // Simple AABB check (ignoring Y for now or assumming infinite height/box height)
        const inside = (
            playerPos.x >= minX && playerPos.x <= maxX &&
            playerPos.z >= minZ && playerPos.z <= maxZ
        )

        if (inside !== isActive) {
            setIsActive(inside)
        }
    })

    // Apply Reverb Effect
    useEffect(() => {
        if (!listener || !buffers[impulseId]) return

        const ctx = listener.context
        const input = listener.getInput()

        if (isActive) {
            // Create Nodes if not exist
            if (!convolverRef.current) {
                convolverRef.current = ctx.createConvolver()
                convolverRef.current.buffer = buffers[impulseId]
                wetGainRef.current = ctx.createGain()
                wetGainRef.current.gain.value = 0.5 // 50% Wet
                dryGainRef.current = ctx.createGain()
                dryGainRef.current.gain.value = 0.8 // 80% Dry
            }

            // Route: Input -> [Dry, Convolver->Wet] -> Destination
            // Disconnect Input -> Destination
            input.disconnect()

            // Connect Dry
            input.connect(dryGainRef.current!)
            dryGainRef.current!.connect(ctx.destination)

            // Connect Wet
            input.connect(convolverRef.current!)
            convolverRef.current!.connect(wetGainRef.current!)
            wetGainRef.current!.connect(ctx.destination)

            console.log("🔊 Entered Reverb Zone")
        } else {
            // Restore: Input -> Destination
            if (convolverRef.current) {
                input.disconnect() // Disconnect all
                input.connect(ctx.destination)

                // Cleanup nodes logic if needed, or just leave them disconnected
                // We shouldn't disconnect dry/wet nodes from destination if we want to smooth fade, 
                // but for hard swap:
                console.log("🔊 Exited Reverb Zone")
            }
        }

        return () => {
            // Cleanup on unmount or change
            if (isActive && listener) {
                try {
                    listener.getInput().disconnect()
                    listener.getInput().connect(listener.context.destination)
                } catch (e) { }
            }
        }
    }, [isActive, listener, buffers, impulseId])

    return (
        <group position={position}>
            {/* Debug visual */}
            <mesh visible={false}>
                <boxGeometry args={size} />
                <meshBasicMaterial color="purple" wireframe opacity={0.2} transparent />
            </mesh>
        </group>
    )
}

export default ReverbZone
