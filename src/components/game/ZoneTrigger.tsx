import React, { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../../store'
import gameSystemInstance from '../../systems/GameSystem'

interface ZoneTriggerProps {
    id: string
    position: [number, number, number]
    size: [number, number, number]
    journalEntry: {
        title: string
        description: string
        stickers?: string[]
    }
}

const ZoneTrigger: React.FC<ZoneTriggerProps> = ({ id, position, size, journalEntry }) => {
    // We don't render anything, but we need logic to check player position.
    // Ideally physics volume, but custom distance check is cheaper/easier without rigidbodies for invisible zones.
    const { addJournalEntry, journalEntries } = useGameStore()
    const [triggered, setTriggered] = useState(false)

    // Check if store already has this entry to avoid check
    if (!triggered && journalEntries.some(e => e.id === id)) {
        setTriggered(true)
    }

    useFrame(() => {
        if (triggered) return

        const playerPos = gameSystemInstance.playerPosition
        const [x, y, z] = position
        const [w, h, d] = size

        // AABB Check
        // Position is center
        const insideX = playerPos.x > x - w / 2 && playerPos.x < x + w / 2
        const insideY = playerPos.y > y - h / 2 && playerPos.y < y + h / 2 // Optional Y check
        const insideZ = playerPos.z > z - d / 2 && playerPos.z < z + d / 2

        if (insideX && insideZ && insideY) {
            setTriggered(true)
            console.log("Entering Zone:", journalEntry.title)
            addJournalEntry({
                id,
                title: journalEntry.title,
                description: journalEntry.description,
                stickers: journalEntry.stickers
            })
            // Dispatch notification event?
        }
    })

    return (
        <group position={new THREE.Vector3(...position)}>
            {/* Debug Visual for Editor Mode? */}
            {/* <mesh visible={false}>
                <boxGeometry args={[...size]} />
                <meshBasicMaterial color="green" wireframe />
            </mesh> */}
        </group>
    )
}

export default ZoneTrigger
