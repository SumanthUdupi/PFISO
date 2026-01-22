import React, { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../store'
import { useSettingsStore } from '../stores/settingsStore' // UX-042
import { useUIStore } from '../stores/uiStore'
import inputs from './InputManager'
import eventBus from './EventBus'

const InteractionManager: React.FC = () => {
    const { camera, scene } = useThree()
    const { setFocusedObject, focusedObject } = useGameStore()
    const lootVisibility = useSettingsStore(state => state.lootVisibility) // UX-042
    const raycaster = useRef(new THREE.Raycaster())

    // Throttle interaction checks to avoid performance hit
    const lastCheckTime = useRef(0)
    const lastInteractTime = useRef(0)
    const CHECK_INTERVAL = 0.1 // PERF-014: Intervals (10Hz) to save CPU

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
                        // UX-033: Contextual Interaction Verbs
                        let verb = "Interact"
                        const type = obj.userData.type?.toLowerCase() || ''

                        if (type.includes('seat') || type.includes('chair')) verb = "Sit"
                        else if (type.includes('npc')) verb = "Talk"
                        else if (type.includes('door')) verb = "Open"
                        else if (type.includes('item') || type.includes('pickup')) verb = "Pick Up"
                        else if (type.includes('monitor') || type.includes('computer')) verb = "Use"

                        // Retrieve Bound Key for HUD
                        // We can't easily get it async here without lag, so we pass the verb
                        // and let HUD handle the key display from InputManager

                        foundInteractable = {
                            id: obj.uuid,
                            label: obj.userData.label || verb, // Use custom label if present, else verb
                            verb: verb, // Explicit verb for HUD to use: "[E] Verb"
                            position: obj.getWorldPosition(new THREE.Vector3()), // Store position
                            type: obj.userData.type, // Store type if needed (e.g., SIT)
                            distance: hit.distance // UX-021: Prompt Clarity (Fade)
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

        // 2. Handle Input (UX-013: Hold to Interact)
        const isInteracting = inputs.isPressed('INTERACT')
        const { setInteractionProgress } = useUIStore.getState()

        if (isInteracting && focusedObject) {
            // Increment timer
            const now = performance.now()
            if (lastInteractTime.current === 0) {
                lastInteractTime.current = now // Start holding
            }

            const holdDuration = now - lastInteractTime.current
            const REQUIRED_HOLD_MS = 100 // Short hold for responsiveness, or 500 for "heavy" interaction?
            // Let's stick to a very short hold or instant for now, OR make it true "hold"
            // Requirement says "Hold to Interact" to avoid accidental.
            // Let's make it 300ms.
            const TARGET_MS = 300

            // Update UI
            setInteractionProgress(Math.min(1, holdDuration / TARGET_MS))

            if (holdDuration >= TARGET_MS) {
                // Trigger!
                // SYS-006: Debounce handled by state check usually, but here we reset
                const data = focusedObject as any
                if (data.position && data.type) {
                    eventBus.emit('PLAYER_COMMAND', {
                        type: 'MOVE_AND_INTERACT',
                        target: data.position,
                        label: focusedObject.label,
                        stopDistance: data.type === 'seat' ? 1.0 : 1.5,
                        interactionType: data.type === 'pickup' ? 'pickup' : data.type,
                        interactionData: data.type === 'pickup' ? { ...data, id: focusedObject.id } : data
                    })
                }

                // Reset to avoid looping (user must release key)
                // We need a flag to say "actions dispatched, wait for release"?
                // For now, let's just reset timer and rely on the fact that action changes state
                // Actually, if we don't block, it will spam. 
                // Simple hack: set timer to future? Or ignore until release.
                lastInteractTime.current = now + 999999 // Lock it
                setInteractionProgress(0)
            }

        } else {
            // Reset
            if (lastInteractTime.current < 999999) { // Only reset if not locked
                lastInteractTime.current = 0
                setInteractionProgress(0)
            }
            if (!isInteracting) {
                // Released
                lastInteractTime.current = 0
                setInteractionProgress(0)
            }
        }
    })

    // Add effect to listen for interact trigger outside loop or inside loop? 
    // Best inside loop to catch the frame it happens or use store callback.
    // Let's rely on standard InputManager polling in loop for now.

    return null
}

export default InteractionManager
