import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import useGameStore from '../../../store' // Or wherever we decide to put the state

// We might need to add `lightsOn` state to the store or a local context
// For now, let's assume we can dispatch an action or use a callback if passed
// Actually, let's update the store first if needed. 
// Plan said "Modify CozyEnvironment to listen to store or new store".
// Let's us useGameStore and add a simple toggle.

export const LightSwitch: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
    const [isOn, setIsOn] = useState(true)

    // We'll dispatch a custom event for now since store might not have it yet
    // Or we can add it to store.ts. Let's add to store.ts for cleanliness.

    const toggleLights = () => {
        const newState = !isOn
        setIsOn(newState)
        window.dispatchEvent(new CustomEvent('toggle-lights', { detail: newState }))
    }

    return (
        <group position={position} rotation={rotation}>
            {/* Box */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow onClick={toggleLights}>
                <boxGeometry args={[0.2, 0.3, 0.05]} />
                <meshStandardMaterial color="#e0e0e0" />
            </mesh>
            {/* Switch */}
            <mesh position={[0, isOn ? 0.05 : -0.05, 0.03]} rotation={[isOn ? -0.2 : 0.2, 0, 0]}>
                <boxGeometry args={[0.1, 0.1, 0.05]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Label */}
            <Html position={[0, 0.3, 0]} center distanceFactor={2} transform>
                <div className="text-[10px] items-center flex bg-black/50 text-white px-1 rounded pointer-events-none">
                    CLICK
                </div>
            </Html>
        </group>
    )
}
