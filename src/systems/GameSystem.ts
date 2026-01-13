import physicsInstance from './PhysicsSystem'
import gameEventBus from './EventBus'

class GameSystem {
    lastTime = 0
    accumulator = 0
    fixedStep = 1 / 60

    isRunning = false

    constructor() {
        this.reset()
    }

    reset() {
        this.lastTime = performance.now()
        this.accumulator = 0
        this.isRunning = true
    }

    // Called by React's useFrame
    update(time: number, deltaTime: number) {
        if (!this.isRunning) return

        // Prevent spiral of death on lag spikes
        if (deltaTime > 0.25) deltaTime = 0.25

        this.accumulator += deltaTime

        while (this.accumulator >= this.fixedStep) {
            this.fixedUpdate(this.fixedStep)
            this.accumulator -= this.fixedStep
        }

        // Interpolation alpha if needed
        // const alpha = this.accumulator / this.fixedStep
    }

    // Physics & Logic Update
    fixedUpdate(dt: number) {
        physicsInstance.step(dt)
        gameEventBus.emit('fixed-update', dt)
    }
}

export const gameSystemInstance = new GameSystem()
export default gameSystemInstance
