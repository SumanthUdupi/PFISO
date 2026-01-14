
// Type definitions for Components
// We keep this flexible. Components are just data attached to an entity.
export interface EntityComponents {
    [key: string]: any
}

export interface EntityData {
    id: string
    tags: Set<string>
    components: EntityComponents
    // We can add a ref to the actual Object3D if needed for direct manipulation, 
    // but usually we want to keep data processing separate from view.
    position?: { x: number, y: number, z: number } // Cached position for quick lookups
}

class EntityManager {
    private static instance: EntityManager
    private entities: Map<string, EntityData> = new Map()
    private listeners: Set<() => void> = new Set()

    private constructor() {
        // Private constructor for Singleton
        if (typeof window !== 'undefined') {
            (window as any).EntityManager = this // For debugging console access
        }
    }

    public static getInstance(): EntityManager {
        if (!EntityManager.instance) {
            EntityManager.instance = new EntityManager()
        }
        return EntityManager.instance
    }

    // --- Core Registry ---

    public registerEntity(id: string, tags: string[] = [], components: EntityComponents = {}) {
        this.entities.set(id, {
            id,
            tags: new Set(tags),
            components,
        })
        this.notifyListeners()
        console.log(`[ECS] Registered Entity: ${id}`, tags)
    }

    public unregisterEntity(id: string) {
        if (this.entities.delete(id)) {
            this.notifyListeners()
            console.log(`[ECS] Unregistered Entity: ${id}`)
        }
    }

    public updateComponent(id: string, componentName: string, data: any) {
        const entity = this.entities.get(id)
        if (entity) {
            entity.components[componentName] = data
            // We usually don't notify listeners on every component update to avoid thrashing,
            // but for reactive UI we might need to. For now, keep it silent.
        }
    }

    public updatePosition(id: string, position: { x: number, y: number, z: number }) {
        const entity = this.entities.get(id)
        if (entity) {
            entity.position = position
        }
    }

    // --- Queries ---

    public getEntity(id: string): EntityData | undefined {
        return this.entities.get(id)
    }

    public getEntitiesWithTag(tag: string): EntityData[] {
        const results: EntityData[] = []
        for (const entity of this.entities.values()) {
            if (entity.tags.has(tag)) {
                results.push(entity)
            }
        }
        return results
    }

    // --- Subscription (Simple) ---
    public subscribe(callback: () => void) {
        this.listeners.add(callback)
        return () => this.listeners.delete(callback)
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb())
    }
}

export const entityManager = EntityManager.getInstance()
