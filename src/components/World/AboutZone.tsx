import React from 'react'
import { Text, Image } from '@react-three/drei'
import { InteractableItem } from '../game/InteractableItem'
import { CozyChair, CozyRug, Plant, CoffeeMug } from '../game/Environment/Decor'
import bioData from '../../assets/data/bio.json'
import { useUIStore } from '../../stores/uiStore'
import { resolveAssetPath } from '../../utils/assetUtils'

export const AboutZone: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const openModal = useUIStore(state => state.openModal)

    return (
        <group position={position}>
            <Text
                position={[0, 4, 0]}
                fontSize={1}
                color="#2F4F4F"
            >
                ABOUT ME
            </Text>

            {/* Cozy Lounge Setup */}
            <CozyRug position={[0, 0, 1]} size={[5, 4]} color="#D7CCC8" />

            {/* Profile Photo - Interactive Board */}
            <InteractableItem
                position={[0, 1.5, -1]}
                label="Read Bio"
                onInteract={() => openModal({
                    title: "About Sumanth",
                    subtitle: bioData.role,
                    description: bioData.summary.join('\n\n'),
                    image: resolveAssetPath(bioData.avatar),
                    tags: ["Biography", "Philosophy", "Goals"],
                    type: 'GENERIC'
                })}
            >
                {/* Board */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[2.5, 3, 0.1]} />
                    <meshStandardMaterial color="#A1887F" />
                </mesh>
                {/* Photo */}
                {bioData.avatar && (
                    <Image
                        url={resolveAssetPath(bioData.avatar)}
                        position={[0, 0.2, 0.06]}
                        scale={[2, 2]}
                    />
                )}
            </InteractableItem>

            {/* Chairs */}
            <CozyChair position={[-2, 0, 1]} rotation={[0, 1, 0]} />
            <CozyChair position={[2, 0, 1]} rotation={[0, -1, 0]} />

            {/* Plants & Decor */}
            <Plant position={[-3, 0, -1]} />
            <Plant position={[3, 0, -1]} />

            {/* Small Coffee Table */}
            <mesh position={[0, 0.3, 1]} receiveShadow castShadow>
                <cylinderGeometry args={[0.5, 0.5, 0.6, 16]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>
            <CoffeeMug position={[0, 0.6, 1]} />

        </group>
    )
}
