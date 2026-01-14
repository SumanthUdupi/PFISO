type EventHandler = (payload: any) => void

class EventManager {
    private listeners: Map<string, EventHandler[]> = new Map()

    on(event: string, handler: EventHandler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event)!.push(handler)

        // Return unsubscribe function
        return () => this.off(event, handler)
    }

    off(event: string, handler: EventHandler) {
        if (!this.listeners.has(event)) return
        const handlers = this.listeners.get(event)!
        const index = handlers.indexOf(handler)
        if (index > -1) {
            handlers.splice(index, 1)
        }
    }

    emit(event: string, payload?: any) {
        if (!this.listeners.has(event)) return
        this.listeners.get(event)!.forEach(handler => {
            try {
                handler(payload)
            } catch (err) {
                console.error(`Error in event handler for ${event}:`, err)
            }
        })
    }

    // Debugging
    clear() {
        this.listeners.clear()
    }
}

// Singleton instance
const globalEvents = new EventManager()
export default globalEvents
