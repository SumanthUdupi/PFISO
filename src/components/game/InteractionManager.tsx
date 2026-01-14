import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'
import useInteractionStore from '../../stores/interactionStore'
import useControlsStore from '../../stores/controlsStore'
import useCursorStore from '../../stores/CursorStore'
import { getCursorUrl } from '../ui/CursorIcons'

// MECH-015: Soft-Lock Targeting System
// MECH-013: Context-Sensitive Cursor logic
// MECH-011: Precision Raycast Interaction (Occlusion)

const InteractionManager = ({ playerPosition, playerForward }: { playerPosition: THREE.Vector3, playerForward?: THREE.Vector3 }) => {
    const { registry, setSoftLocked, hoveredId } = useInteractionStore()
    const { setCursor } = useCursorStore()
    const lastCheckTime = useRef(0)
    const { camera } = useThree()
    const { world } = useRapier()

    // Context Sensitive Cursor (MECH-013)
    useEffect(() => {
        if (hoveredId) {
            const data = registry.get(hoveredId)
            const type = data?.type || 'inspect' // Default to inspect

            // Map game types to cursor types
            let cursorKey: 'talk' | 'inspect' | 'grab' = 'inspect'
            if (type === 'talk') cursorKey = 'talk'
            else if (type === 'grab') cursorKey = 'grab'

            const url = getCursorUrl(cursorKey)
            document.body.style.cursor = `url('${url}') 16 16, auto`
        } else {
            // Revert to default
            document.body.style.cursor = 'auto'
        }
    }, [hoveredId, registry])

    // Soft Lock Logic (MECH-015)
    useFrame((state) => {
        // Run check every 100ms or so, not every frame for perf
        if (state.clock.elapsedTime - lastCheckTime.current < 0.1) return
        lastCheckTime.current = state.clock.elapsedTime

        // If mouse is hovering something, that wins.
        if (hoveredId) {
            setSoftLocked(null)
            return
        }

        // Find closest object within cone & line of sight
        let bestCandidateId: string | null = null
        let maxScore = -Infinity
        const MAX_DIST = 4.0
        const MIN_DOT = 0.5 // 60 degrees

        // Raycast origin from camera for visibility check
        const rayOrigin = camera.position.clone()

        registry.forEach((data, id) => {
            const toObj = data.position.clone().sub(playerPosition)
            const dist = toObj.length()

            if (dist > MAX_DIST) return

            let score = -dist // closer is better

            // 1. Cone Check
            // Apply cone check if we have a forward vector
            if (playerForward) {
                const dir = toObj.normalize()
                const dot = dir.dot(playerForward)

                // MECH-FIX: if very close, allow wider angle
                const effectiveMinDot = dist < 1.0 ? 0.2 : MIN_DOT

                if (dot < effectiveMinDot) return // Outside cone

                score += dot * 2 // Boost score by alignment
            }

            // 2. Occlusion Check (MECH-011)
            // Check if wall passes between camera and object
            if (world) {
                const camToObj = data.position.clone().sub(rayOrigin)
                const camDist = camToObj.length()
                const rayDir = camToObj.normalize()
                const ray = new state.rapier.Ray(rayOrigin, rayDir)

                // Cast ray. Limit logic: if we hit something < camDist - 0.5, it's a wall.
                // solid: true ensures we hit static geometry.
                const hit = world.castRay(ray, camDist - 0.5, true)
                if (hit) {
                    // Wall blocks view
                    return
                }
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
