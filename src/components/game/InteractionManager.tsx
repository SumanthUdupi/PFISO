import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useInteractionStore from '../../stores/interactionStore'
import useControlsStore from '../../stores/controlsStore'
import useCursorStore from '../../stores/CursorStore'

// MECH-015: Soft-Lock Targeting System
// MECH-013: Context-Sensitive Cursor logic

const InteractionManager = ({ playerPosition, playerForward }: { playerPosition: THREE.Vector3, playerForward?: THREE.Vector3 }) => {
    const { registry, setSoftLocked, hoveredId } = useInteractionStore()
    const { setCursor } = useCursorStore()
    const lastCheckTime = useRef(0)
    const { camera } = useThree()

    // Context Sensitive Cursor (MECH-013)
    useEffect(() => {
        if (hoveredId) {
            setCursor('pointer') // Could be 'hand' if we had it, using pointer for now
        } else {
            setCursor('default')
        }
    }, [hoveredId, setCursor])

    // Soft Lock Logic (MECH-015)
    useFrame((state) => {
        // Run check every 100ms or so, not every frame for perf, or every frame if lightweight
        if (state.clock.elapsedTime - lastCheckTime.current < 0.1) return
        lastCheckTime.current = state.clock.elapsedTime

        // If mouse is hovering something, that wins.
        if (hoveredId) {
            setSoftLocked(null)
            return
        }

        // Find closest object within cone
        let bestCandidateId: string | null = null
        let maxScore = -Infinity

        // We need player forward vector.
        // If not provided prop, we can infer from last move or use camera?
        // Using camera forward for "Look at" feel might be better for third person?
        // Requirement MECH-015 says: "PlayerForwardVector".
        // But if player is idle, forward might be arbitrary.
        // Let's use Camera direction if mouse not involved? Or Player Body Rotation?
        // Player Body Rotation is usually reliable.

        // Assuming playerForward is passed or we calculate from something.
        // If not passed, we can't do cone check properly.
        // Fallback: Distance only (Legacy behavior but cleaner).

        // Let's assume we want distance < 3.0
        const MAX_DIST = 3.0
        const MIN_DOT = 0.5 // 60 degrees

        registry.forEach((data, id) => {
            const toObj = data.position.clone().sub(playerPosition)
            const dist = toObj.length()

            if (dist > MAX_DIST) return

            let score = -dist // closer is better

            // Apply cone check if we have a forward vector
            if (playerForward) {
                const dir = toObj.normalize()
                const dot = dir.dot(playerForward)
                if (dot < MIN_DOT) return // Outside cone

                score += dot * 2 // Boost score by alignment
            }

            if (score > maxScore) {
                maxScore = score
                bestCandidateId = id
            }
        })

        setSoftLocked(bestCandidateId)
    })

    return null
}

export default InteractionManager
