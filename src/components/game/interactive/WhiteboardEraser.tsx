import React from 'react'
import { RigidBody } from '@react-three/rapier'

export const WhiteboardEraser: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    // Determine if we want this to be a physics object or just a click trigger.
    // Let's make it a physics object you can throw, but clicking it triggers the "Erase" event for the board.

    const handleClick = () => {
        // e.stopPropagation() // Let it coexist with pickup if we implement pickup on click vs drag
        window.dispatchEvent(new Event('clear-whiteboard'))
    }

    return (
        <RigidBody position={position} colliders="cuboid" restitution={0.2} friction={0.5}>
            <mesh castShadow onClick={handleClick}>
                <boxGeometry args={[0.2, 0.05, 0.1]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            {/* Felt bottom */}
            <mesh position={[0, -0.026, 0]}>
                <boxGeometry args={[0.2, 0.01, 0.1]} />
                <meshStandardMaterial color="#eee" />
            </mesh>
        </RigidBody>
    )
}
