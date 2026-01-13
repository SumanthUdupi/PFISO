export abstract class State<T> {
    protected machine: StateMachine<T>;
    protected context: T;

    constructor(machine: StateMachine<T>, context: T) {
        this.machine = machine;
        this.context = context;
    }

    abstract enter(): void;
    abstract exit(): void;
    abstract update(delta: number): void;
}

export class StateMachine<T> {
    private currentState: State<T> | null = null;
    private states: Map<string, State<T>> = new Map();
    private isRunning: boolean = false;

    constructor() { }

    addState(name: string, state: State<T>) {
        this.states.set(name, state);
    }

    changeState(name: string) {
        if (!this.states.has(name)) {
            console.warn(`State ${name} not found!`);
            return;
        }

        if (this.currentState) {
            this.currentState.exit();
        }

        this.currentState = this.states.get(name)!;
        this.currentState.enter();
    }

    update(delta: number) {
        if (this.currentState) {
            this.currentState.update(delta);
        }
    }

    start(initialState: string) {
        this.changeState(initialState);
        this.isRunning = true;
    }
}
