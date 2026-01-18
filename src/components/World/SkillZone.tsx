import React, { useMemo } from 'react'
import { Text, Float } from '@react-three/drei'
import { InteractableItem } from '../game/InteractableItem'
import { BookStack } from '../game/Environment/Decor'
import bioData from '../../assets/data/bio.json'
import { useUIStore } from '../../stores/uiStore'

export const SkillZone: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const openModal = useUIStore(state => state.openModal)

    // Flatten skills for display
    const allSkills = useMemo(() => {
        return bioData.skills.flatMap(category =>
            category.items.map(item => ({
                ...item,
                category: category.category
            }))
        )
    }, [])

    return (
        <group position={position}>
            <Text
                position={[0, 4, 0]}
                fontSize={1}
                color="#2F4F4F"
            >
                SKILLS
            </Text>

            {allSkills.map((skill, idx) => {
                // Spiral layout
                const angle = idx * 0.8
                const radius = 3 + (idx * 0.2)
                const x = Math.cos(angle) * radius
                const z = Math.sin(angle) * radius

                return (
                    <InteractableItem
                        key={skill.name}
                        position={[x, 0, z]}
                        label={skill.name}
                        onInteract={() => openModal({
                            title: skill.name,
                            subtitle: skill.level,
                            description: skill.description,
                            tags: [skill.category, skill.level],
                            type: 'GENERIC'
                        })}
                    >
                        {/* Pedestal */}
                        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.3, 0.4, 1, 6]} />
                            <meshStandardMaterial color="#8D6E63" />
                        </mesh>

                        {/* Floating Crystal */}
                        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
                            <mesh position={[0, 1.5, 0]} castShadow>
                                <dodecahedronGeometry args={[0.3, 0]} />
                                <meshStandardMaterial
                                    color="#E2725B"
                                    emissive="#E2725B"
                                    emissiveIntensity={0.5}
                                    roughness={0.1}
                                    metalness={0.9}
                                />
                            </mesh>
                        </Float>

                        {/* Scattered Books */}
                        <group position={[0.4, 0, 0.4]}>
                            <BookStack position={[0, 0, 0]} />
                        </group>
                    </InteractableItem>
                )
            })}
        </group>
    )
}
