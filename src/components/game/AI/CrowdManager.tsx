import React, { useEffect, useState } from 'react'
import { CrowdAgent } from './CrowdAgent'
import navigationSystem from '../../../systems/NavigationSystem'
import * as THREE from 'three'

export const CrowdManager: React.FC = () => {
    const [agents, setAgents] = useState<any[]>([])
    const AGENT_COUNT = 8

    useEffect(() => {
        // Wait for NavMesh ready?
        // We can poll or just try spawning after a delay.
        // Or assume NavMesh init is fast (it happens in NavigationManager useEffect).

        const spawnAgents = () => {
            if (!navigationSystem.isReady) {
                setTimeout(spawnAgents, 500)
                return
            }

            const newAgents = []
            const colors = ['#f44336', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#795548', '#607d8b', '#e91e63']

            for (let i = 0; i < AGENT_COUNT; i++) {
                const startPos = navigationSystem.getRandomPoint() || new THREE.Vector3(Math.random() * 5, 0, Math.random() * 5)
                newAgents.push({
                    id: i,
                    position: [startPos.x, startPos.y + 1, startPos.z] as [number, number, number],
                    color: colors[i % colors.length],
                    patrolPathId: i === 0 ? 'path_01' : undefined // Agent 0 patrols
                })
            }
            setAgents(newAgents)
        }

        spawnAgents()
    }, [])

    return (
        <>
            {agents.map(agent => (
                <CrowdAgent
                    key={agent.id}
                    id={agent.id}
                    startPosition={agent.position}
                    color={agent.color}
                    patrolPathId={agent.patrolPathId}
                />
            ))}
        </>
    )
}
