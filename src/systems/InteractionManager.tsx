import React, { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../store'
import inputs from './InputManager'
import eventBus from './EventBus'

const InteractionManager: React.FC = () => {
    const { camera, scene } = useThree()
    const { setFocusedObject, focusedObject } = useGameStore()
    const raycaster = useRef(new THREE.Raycaster())

    // Throttle interaction checks to avoid performance hit
    const lastCheckTime = useRef(0)
    const lastInteractTime = useRef(0)
    const CHECK_INTERVAL = 0.0 // PM-030: Instant (No Lag)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // 1. Raycast for Focus
        if (time - lastCheckTime.current >= CHECK_INTERVAL) {
            lastCheckTime.current = time
            raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)
            const intersects = raycaster.current.intersectObjects(scene.children, true)
            let foundInteractable = null

            for (let i = 0; i < intersects.length; i++) {
                const hit = intersects[i]
                if (hit.distance > 3.0) break // PM-022: Reduced Interaction Range (3.0m)

                let obj: THREE.Object3D | null = hit.object
                // CS-046: Interaction Ray Mismatch - Ignore Player
                // Assuming player mesh has name 'Player' or specific tag. 
                // We'll traverse up to check if root is Player usually.
                // For now, let's assume standard "Interactable" check handles it, 
                // BUT we ensure we don't stop at the player if they block the ray.
                // If it's the player, we just continue.
                if (obj.name === 'Player' || obj.userData?.isPlayer) continue

                while (obj) {
                    if (obj.userData && obj.userData.interactable) {
                        foundInteractable = {
                            id: obj.uuid,
                            label: obj.userData.label || "Interact",
                            position: obj.getWorldPosition(new THREE.Vector3()), // Store position
                            type: obj.userData.type // Store type if needed (e.g., SIT)
                        }
                        break
                    }
                    obj = obj.parent
                }
                if (foundInteractable) break
            }

            if (foundInteractable?.id !== focusedObject?.id) {
                setFocusedObject(foundInteractable)

                // MECH-013: Update Cursor
                const setCursor = useGameStore.getState().setCursorType
                if (foundInteractable?.type === 'pickup') setCursor('GRAB')
                else if (foundInteractable?.type === 'seat') setCursor('SIT')
                else if (foundInteractable?.type === 'npc') setCursor('TALK')
                else if (foundInteractable) setCursor('HOVER') // If it's interactable but not specific type
                else setCursor('DEFAULT') // Fallback if foundInteractable is null here (shouldn't happen if condition is met)

            } else if (!foundInteractable && focusedObject !== null) {
                setFocusedObject(null)
                useGameStore.getState().setCursorType('DEFAULT')
            }
        }

        // 2. Handle Input
        if (inputs.justPressed('INTERACT') && focusedObject) {
            const now = performance.now()
            // SYS-006: Debounce interaction (500ms) to prevent double-trigger/duplication
            if (now - lastInteractTime.current < 500) return
            lastInteractTime.current = now

            // We have a target.

            // Access Player Controller via GameSystem (We need to ensure Player registers itself!)
            // Assuming GameSystem has a 'playerRef' or similar. 
            const data = focusedObject as any
            if (data.position && data.type) {
                if (data.type === 'pickup') {
                    // direct pickup command? or move then pickup?
                    // Let's do move then pickup to be consistent
                    eventBus.emit('PLAYER_COMMAND', {
                        type: 'MOVE_AND_INTERACT',
                        target: data.position,
                        label: focusedObject.label,
                        stopDistance: 1.5, // Get closer for pickup
                        interactionType: 'pickup',
                        interactionData: { ...data, id: focusedObject.id } // Pass ID to know what to pickup
                    })
                } else {
                    // Generic
                    eventBus.emit('PLAYER_COMMAND', {
                        type: 'MOVE_AND_INTERACT',
                        target: data.position,
                        label: focusedObject.label,
                        stopDistance: data.type === 'seat' ? 1.0 : 1.5,
                        interactionType: data.type,
                        interactionData: data
                    })
                }
            }
        }
    })

    // Add effect to listen for interact trigger outside loop or inside loop? 
    // Best inside loop to catch the frame it happens or use store callback.
    // Let's rely on standard InputManager polling in loop for now.

    return null
}

export default InteractionManager
