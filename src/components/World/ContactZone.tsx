import React from 'react'
import { InteractableItem } from '../game/InteractableItem'
import { Text } from '@react-three/drei'
import { useUIStore } from '../../stores/uiStore'

interface ContactZoneProps {
    position: [number, number, number]
}

export const ContactZone: React.FC<ContactZoneProps> = ({ position }) => {
    const openModal = useUIStore(state => state.openModal)

    return (
        <group position={position}>
            {/* Zone Label */}
            <Text
                position={[0, 4, 0]}
                fontSize={0.6}
                color="#5e503f"
                anchorX="center"
                anchorY="middle"
            >
                CONTACT
            </Text>

            {/* Mailbox / Interactive Desk */}
            <InteractableItem
                position={[0, 0, 0]}
                label="Send a Message"
                onInteract={() => openModal({
                    title: 'Get in Touch',
                    description: '',
                    type: 'CONTACT',
                    subtitle: 'Open for Opportunities'
                })}
            >
                {/* Visual Representation: A Mailbox or Desk */}
                <group>
                    {/* Desk Body */}
                    <mesh position={[0, 0.75, 0]} castShadow>
                        <boxGeometry args={[2, 1.5, 1]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                    {/* Desk Top */}
                    <mesh position={[0, 1.55, 0]} castShadow>
                        <boxGeometry args={[2.2, 0.1, 1.2]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>
                    {/* Laptop/Paper */}
                    <mesh position={[0, 1.6, 0]}>
                        <boxGeometry args={[0.5, 0.05, 0.4]} />
                        <meshStandardMaterial color="#FFFFFF" />
                    </mesh>
                </group>
            </InteractableItem>

            {/* Decorative Elements around Contact Zone */}
            <mesh position={[2, 0.5, 1]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                <meshStandardMaterial color="#8d6e63" />
            </mesh>
            <mesh position={[2, 1.2, 1]} castShadow>
                <sphereGeometry args={[0.4]} />
                <meshStandardMaterial color="#556b2f" />
            </mesh>
        </group>
    )
}
