import React, { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import InteractiveObject from '../InteractiveObject'
import globalEvents from '../../../systems/EventManager'

import PositionalSound from '../../audio/PositionalSound'

// MECH-016: Usable Object State Machine
// Wraps InteractiveObject but adds logic + event listening

interface UsableObjectProps {
    id: string
    position: [number, number, number]
    rotation?: [number, number, number]
    label: string
    type?: 'switch' | 'door' | 'collectible'
    initialState?: boolean
    onToggle?: (newState: boolean) => void
    colorOn?: string
    colorOff?: string
}

const UsableObject: React.FC<UsableObjectProps> = ({
    id, position, rotation, label, type = 'switch', initialState = false, onToggle,
    colorOn = '#4caf50', colorOff = '#f44336'
}) => {
    const [isOn, setIsOn] = useState(initialState)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [playClick, setPlayClick] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Listen for interactions
    useEffect(() => {
        const handleInteraction = (payload: any) => {
            if (payload.label === label) { // Simple matching by Label for now, ideally by ID if passed in interaction
                // Toggle State
                const newState = !isOn
                setIsOn(newState)
                if (onToggle) onToggle(newState)

                // Feedback
                setFeedback(newState ? "ON" : "OFF")
                setPlayClick(true)
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => {
                    setFeedback(null)
                    setPlayClick(false)
                }, 1000)

                // Emit State Change for other systems
                globalEvents.emit('OBJECT_STATE_CHANGE', { id, state: newState })
            }
        }

        // Listen to global trigger
        // Note: InteractionManager triggers interaction by Label. 
        // We need to make sure interaction targets this object.
        // For now, Label matching is unique enough for this demo.
        const unsubscribe = globalEvents.on('INTERACT_TRIGGER', handleInteraction)
        return () => {
            unsubscribe?.()
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [isOn, label, id, onToggle])

    // Visuals
    const color = isOn ? colorOn : colorOff

    return (
        <group position={new THREE.Vector3(...position)} rotation={new THREE.Vector3(...(rotation || [0, 0, 0]))}>
            <InteractiveObject
                label={label}
                color={color}
                type="inspect" // Uses the 'inspect' cursor for now
                onClick={() => {
                    // In new system, we rely on Player emitting event via Keyboard 'E' 
                    // OR clicking also triggers it?
                    // Currently Lobby handles click -> Move -> Interact.
                    // The Player emits 'INTERACT_TRIGGER' when it reaches target.
                    // So we don't need direct onClick logic here other than what InteractiveObject provides (Move command)
                }}
            />
            {/* Additional Status Mesh (e.g. Light Bulb) */}
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isOn ? 2 : 0}
                />
            </mesh>
            {isOn && (
                <pointLight distance={5} intensity={1} color={color} position={[0, 2, 0]} />
            )}

            {feedback && (
                <Html position={[0, 2.5, 0]} center>
                    <div style={{
                        color: 'white', background: 'rgba(0,0,0,0.8)',
                        padding: '4px 8px', borderRadius: '4px',
                        fontSize: '12px', fontWeight: 'bold'
                    }}>
                        {feedback}
                    </div>
                </Html>
            )}

            {/* MECH-045: Spatial Audio */}
            <PositionalSound type={type === 'switch' ? 'click' : type === 'door' ? 'unlock' : 'success'} trigger={playClick} />
        </group>
    )
}

export default UsableObject
