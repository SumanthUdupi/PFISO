export interface State {
    name: string;
    enter: (entity: any) => void;
    update: (entity: any, dt: number) => void;
    exit: (entity: any) => void;
}

export class StateMachine {
    currentState: State | null = null;
    entity: any;
    states: Map<string, State> = new Map();

    constructor(entity: any) {
        this.entity = entity;
    }

    addState(state: State) {
        this.states.set(state.name, state);
    }

    changeState(name: string) {
        if (this.currentState && this.currentState.name === name) return;

        if (this.currentState) {
            this.currentState.exit(this.entity);
        }

        const newState = this.states.get(name);
        if (newState) {
            this.currentState = newState;
            this.currentState.enter(this.entity);
        } else {
            console.warn(`State ${name} not found!`);
        }
    }

    update(dt: number) {
        if (this.currentState) {
            this.currentState.update(this.entity, dt);
        }
    }
}
