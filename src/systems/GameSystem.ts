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

    // SYS-039: Tracking previous data
    lastData: { position: [number, number, number] } = { position: [0, 0, 0] }

    constructor() {
        this.reset()
    }

    reset() {
        this.lastTime = performance.now()
        this.accumulator = 0
        this.timeScale = 1.0
        this.isRunning = true
        this.lastData = { position: [0, 0, 0] }

        // SYS-037: Fast Travel Listener
        gameEventBus.on('TELEPORT', (pos: { x: number, y: number, z: number }) => {
            this.playerPosition = { ...pos }
            this.playerVelocity = { x: 0, y: 0, z: 0 }
            console.log('Teleported to', pos)
        })
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

        // SYS-011: Use system time delta to prevent drift
        const now = performance.now()
        let dt = (now - this.lastTime) / 1000
        this.lastTime = now

        // Global Inputs
        inputs.update() // Update input state once per frame
        if (inputs.justPressed('INVENTORY')) {
            useGameStore.getState().toggleInventory()
        }
        if (inputs.justPressed('MENU')) {
            useGameStore.getState().togglePause()
        }
        if (inputs.justPressed('QUICK_SAVE')) {
            // SYS-021: Quick Save
            import('../systems/SaveManager').then(({ saveManager }) => {
                saveManager.saveGame().then(() => {
                    useGameStore.getState().addNotification({
                        id: Date.now(),
                        title: 'Game Saved',
                        message: 'Quick save successful',
                        type: 'info',
                        duration: 2000
                    })
                })
            })
        }
        if (inputs.justPressed('TOGGLE_PHOTO_MODE')) {
            useGameStore.getState().togglePhotoMode()
        }

        // Prevent spiral of death on lag spikes
        if (dt > 0.25) dt = 0.25

        // Apply Time Scale
        const scaledDelta = dt * this.timeScale

        this.accumulator += scaledDelta

        // SYS-039: Stats Tracking
        const dist = Math.sqrt(
            Math.pow(this.playerPosition.x - this.lastData.position[0], 2) +
            Math.pow(this.playerPosition.z - this.lastData.position[2], 2)
        )
        // Update stats (throttle this in a real game, but for now every frame/tick is fine or maybe every second)
        // Actually, updating store every frame is bad for performance. Let's do it sparingly or use a local accumulator.
        // For simplicity in this prototype, we'll just update it directly but maybe checks if dist > 0 or dt > 0
        if (dt > 0) {
            useGameStore.getState().incrementStats(dt / 1000, dist > 0.01 ? dist : 0);
        }

        // Update lastData for next frame
        this.lastData.position = [this.playerPosition.x, this.playerPosition.y, this.playerPosition.z]

        // Check for pickups
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
