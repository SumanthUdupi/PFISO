import React, { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { InteractableItem } from '../game/InteractableItem'
import DeskGroup from '../game/Environment/DeskGroup'
import { Plant } from '../game/Environment/Decor'
import bioData from '../../assets/data/bio.json'
import { useUIStore } from '../../stores/uiStore'
import { Whiteboard } from '../game/interactive/Whiteboard'
import { WhiteboardEraser } from '../game/interactive/WhiteboardEraser'

export const WorkZone: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const openModal = useUIStore(state => state.openModal)

    const workItems = useMemo(() => {
        return bioData.experience.map((job, index) => ({
            ...job,
            offset: [index * 4, 0, 0] // Spread them out
        }))
    }, [])

    return (
        <group position={position}>
            <Text
                position={[0, 4, 0]}
                fontSize={1}
                color="#2F4F4F"
            >
                WORK EXPERIENCE
            </Text>

            {workItems.map((job, idx) => (
                <InteractableItem
                    key={`${job.company}-${idx}`}
                    position={[job.offset[0] - (workItems.length * 2), 0, 0]} // Center them
                    label={`Inspect ${job.company}`}
                    onInteract={() => openModal({
                        title: job.role,
                        subtitle: job.company,
                        description: `Years: ${job.years}`,
                        type: 'EXPERIENCE'
                    })}
                >
                    {/* Detailed Desk */}
                    <DeskGroup position={[0, 0, 0]} rotation={[0, Math.PI, 0]} />

                    {/* Decor: Plant next to the desk */}
                    <Plant position={[1.2, 0, 0.5]} />

                    {/* Floating Label */}
                    <Text
                        position={[0, 2.5, 0]}
                        fontSize={0.3}
                        color="#5e503f"
                        maxWidth={2}
                        textAlign="center"
                    >
                        {job.company}
                    </Text>
                </InteractableItem>
            ))}

            {/* Strategic Whiteboard Placement */}
            <group position={[6, 0.5, 2]} rotation={[0, -Math.PI / 4, 0]}>
                <Whiteboard position={[0, 1.2, 0]} />
                {/* Eraser on the tray (approximate) */}
                <WhiteboardEraser position={[0.5, 0.25, 0.2]} />
            </group>
        </group>
    )
}
