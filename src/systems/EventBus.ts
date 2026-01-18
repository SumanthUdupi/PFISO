type Handler<T = any> = (payload: T) => void;

class EventBus {
    private handlers: Map<string, Handler[]> = new Map();

    on<T>(event: string, handler: Handler<T>) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)?.push(handler);
    }

    off<T>(event: string, handler: Handler<T>) {
        const handlers = this.handlers.get(event);
        if (!handlers) return;
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    emit<T>(event: string, payload: T) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.forEach(h => h(payload));
        }
    }

    // Clear all for cleanup if needed
    clear() {
        this.handlers.clear();
    }
}

const eventBus = new EventBus();
export default eventBus;
