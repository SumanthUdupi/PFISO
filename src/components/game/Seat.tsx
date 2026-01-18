import React from 'react'
import * as THREE from 'three'
import { InteractableItem } from './InteractableItem'

interface SeatProps {
    position: [number, number, number]
    rotation?: [number, number, number] // Euler
    args?: [number, number, number] // Collider size (optional)
}

const Seat: React.FC<SeatProps> = ({ position, rotation = [0, 0, 0], args = [1, 1, 1] }) => {

    const handleInteract = () => {
        console.log("Sitting down...")
        // Find player instance? 
        // We need a way to reference the Player. 
        // GameSystem usually holds reference to important things, or we use EventBus.
        // Or we use a global store for "PlayerState".
        // In this architecture, Player exposes an Imperative Handle.
        // We can dispatch an event that Player listens to, or use gameSystemInstance if I wired it up.

        // Let's assume we can emit an event "REQUEST_SIT" with target info.
        const targetPos = new THREE.Vector3(...position)
        const targetRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation))

        // Dispatch Event
        window.dispatchEvent(new CustomEvent('player-sit', {
            detail: { position: targetPos, rotation: targetRot }
        }))
    }

    return (
        <InteractableItem
            position={position}
            label="Sit"
            onInteract={handleInteract}
        >
            {/* Visual Debug or Invisible? Usually the parent model provides the visual (Chair). 
                This component is just the trigger. */}
            {/* <mesh visible={false}>
                <boxGeometry args={args} />
                <meshBasicMaterial color="blue" wireframe />
            </mesh> */}
        </InteractableItem>
    )
}

export default Seat
