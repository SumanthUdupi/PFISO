export interface Component {
    _type: string
}

export class Entity {
    id: string
    components: Map<string, Component> = new Map()

    constructor(id: string) {
        this.id = id
    }

    addComponent(component: Component) {
        this.components.set(component._type, component)
        return this
    }

    getComponent<T extends Component>(type: string): T | undefined {
        return this.components.get(type) as T
    }

    hasComponent(type: string): boolean {
        return this.components.has(type)
    }

    removeComponent(type: string) {
        this.components.delete(type)
    }
}

export abstract class System {
    abstract update(dt: number, entities: Entity[]): void
}

export class World {
    entities: Map<string, Entity> = new Map()
    systems: System[] = []

    createEntity(): Entity {
        const id = Math.random().toString(36).substr(2, 9)
        const entity = new Entity(id)
        this.entities.set(id, entity)
        return entity
    }

    addSystem(system: System) {
        this.systems.push(system)
    }

    update(dt: number) {
        const entityList = Array.from(this.entities.values())
        for (const system of this.systems) {
            system.update(dt, entityList)
        }
    }
}

// Global ECS World Instance (optional singleton)
export const ecsWorld = new World()
