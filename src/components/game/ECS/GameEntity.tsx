import React, { useEffect } from 'react'
import { entityManager } from '../../../systems/EntityManager'

interface GameEntityProps {
    id: string
    tags?: string[]
    components?: Record<string, any>
    children?: React.ReactNode
}

/**
 * GameEntity Component
 * Registers itself with the EntityManager on mount and unregisters on unmount.
 * Any children (meshes, logic) are rendered normally.
 */
const GameEntity: React.FC<GameEntityProps> = ({ id, tags = [], components = {}, children }) => {

    useEffect(() => {
        // Register
        entityManager.registerEntity(id, tags, components)

        return () => {
            // Unregister
            entityManager.unregisterEntity(id)
        }
    }, [id]) // Re-register if ID changes (rare)

    // Sync components if they change (deep check might be needed, but simple ref update for now)
    useEffect(() => {
        const entity = entityManager.getEntity(id)
        if (entity) {
            // Update all passed components
            Object.entries(components).forEach(([key, value]) => {
                entityManager.updateComponent(id, key, value)
            })
        }
    }, [components, id])

    return <>{children}</>
}

export default GameEntity
