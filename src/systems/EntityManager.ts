
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

    private tagCache: Map<string, Set<string>> = new Map()

    public registerEntity(id: string, tags: string[] = [], components: EntityComponents = {}) {
        this.entities.set(id, {
            id,
            tags: new Set(tags),
            components,
        })
        // PERF-028: Update Tag Cache (O(1) lookup preparation)
        tags.forEach(tag => {
            if (!this.tagCache.has(tag)) this.tagCache.set(tag, new Set())
            this.tagCache.get(tag)?.add(id)
        })

        this.notifyListeners()
        console.log(`[ECS] Registered Entity: ${id}`, tags)
    }

    public unregisterEntity(id: string) {
        const entity = this.entities.get(id)
        if (entity) {
            // PERF-028: Remove from Tag Cache
            entity.tags.forEach(tag => {
                this.tagCache.get(tag)?.delete(id)
            })
        }

        if (this.entities.delete(id)) {
            this.notifyListeners()
            console.log(`[ECS] Unregistered Entity: ${id}`)
        }
    }

    // ... updateComponent ...

    public updateComponent(id: string, componentName: string, data: any) {
        const entity = this.entities.get(id)
        if (entity) {
            entity.components[componentName] = data
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
        // PERF-028: O(1) Lookup using Set
        if (!this.tagCache.has(tag)) return []
        const ids = this.tagCache.get(tag)!
        const results: EntityData[] = []
        ids.forEach(id => {
            const e = this.entities.get(id)
            if (e) results.push(e)
        })
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
