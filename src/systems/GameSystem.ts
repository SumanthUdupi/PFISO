// import physicsInstance from './PhysicsSystem' // Deprecated
import gameEventBus from './EventBus'
import inputs from './InputManager'
import useGameStore from '../store'

class GameSystem {
    lastTime = 0
    accumulator = 0
    fixedStep = 1 / 60

    // MECH-026: Time Scale
    timeScale = 1.0
    hitStopTimeout: any = null

    isRunning = false
    playerPosition = { x: 0, y: 0, z: 0 }
    playerVelocity = { x: 0, y: 0, z: 0 }

    constructor() {
        this.reset()
    }

    reset() {
        this.lastTime = performance.now()
        this.accumulator = 0
        this.timeScale = 1.0
        this.isRunning = true
    }

    // MECH-026: Hit Stop
    hitStop(duration: number) {
        this.timeScale = 0.05 // Slow down to 5% speed (crunchy)
        if (this.hitStopTimeout) clearTimeout(this.hitStopTimeout)

        this.hitStopTimeout = setTimeout(() => {
            this.timeScale = 1.0
        }, duration) // duration in ms
    }

    // Called by React's useFrame
    update(time: number, deltaTime: number) {
        if (!this.isRunning) return

        // Global Inputs
        inputs.update() // Update input state once per frame
        if (inputs.justPressed('INVENTORY')) {
            useGameStore.getState().toggleInventory()
        }
        if (inputs.justPressed('MENU')) {
            useGameStore.getState().togglePause()
        }

        // Prevent spiral of death on lag spikes
        if (deltaTime > 0.25) deltaTime = 0.25

        // Apply Time Scale
        const scaledDelta = deltaTime * this.timeScale

        this.accumulator += scaledDelta

        // We no longer drive physics here, Rapier handles it in <Physics> component (which uses useFrame internally).
        // However, we can use this for OTHER fixed-time logic (AI, etc.)

        while (this.accumulator >= this.fixedStep) {
            this.fixedUpdate(this.fixedStep)
            this.accumulator -= this.fixedStep
        }

        // Interpolation alpha if needed
        // const alpha = this.accumulator / this.fixedStep
    }

    // Logic Update
    fixedUpdate(dt: number) {
        // physicsInstance.step(dt) // Removed
        gameEventBus.emit('fixed-update', dt)
    }
}

export const gameSystemInstance = new GameSystem()
export default gameSystemInstance
