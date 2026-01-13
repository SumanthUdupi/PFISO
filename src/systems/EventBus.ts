type EventHandler<T = any> = (data: T) => void

class EventBus {
    private listeners: { [key: string]: EventHandler[] } = {}

    on<T>(event: string, handler: EventHandler<T>) {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        this.listeners[event].push(handler)
        return () => this.off(event, handler)
    }

    off<T>(event: string, handler: EventHandler<T>) {
        if (!this.listeners[event]) return
        this.listeners[event] = this.listeners[event].filter(h => h !== handler)
    }

    emit<T>(event: string, data?: T) {
        if (!this.listeners[event]) return
        this.listeners[event].forEach(handler => handler(data))
    }
}

export const gameEventBus = new EventBus()
export default gameEventBus
