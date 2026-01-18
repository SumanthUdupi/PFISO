// MECH-044: Input Manager

export type ActionType = 'JUMP' | 'DASH' | 'INTERACT' | 'MENU' | 'INVENTORY' | 'CROUCH' | 'LEAN_LEFT' | 'LEAN_RIGHT' | 'INSPECT' | 'THROW_DROP' | 'PRIMARY_ACTION' | 'SECONDARY_ACTION' | 'TOGGLE_CONSOLE' | 'TOGGLE_PHOTO_MODE' | 'TOGGLE_EDIT_MODE' | 'ROTATE_OBJECT'
export type AxisType = 'MOVE_X' | 'MOVE_Y' | 'LOOK_X' | 'LOOK_Y'

type KeyBinding = string[]

class InputManager {
    // Configuration
    public bindings: { [key in ActionType]: KeyBinding } = {
        JUMP: [' ', 'space'],
        DASH: ['shift', 'shiftleft', 'shiftright'],
        INTERACT: ['f', 'enter'],
        MENU: ['escape', 'p'],
        INVENTORY: ['i', 'tab'],
        CROUCH: ['control', 'controlleft', 'c'],
        LEAN_LEFT: ['q'],
        LEAN_RIGHT: ['e'],
        INSPECT: ['r'],
        THROW_DROP: ['g'],
        PRIMARY_ACTION: ['mouse0'], // Left Click
        SECONDARY_ACTION: ['mouse2'], // Right Click
        TOGGLE_CONSOLE: ['`', 'f1'],
        TOGGLE_PHOTO_MODE: ['p'],
        TOGGLE_EDIT_MODE: ['b'],
        ROTATE_OBJECT: ['t']
    }

    // State
    private keys: { [key: string]: boolean } = {}
    private actions: { [key in ActionType]: boolean } = {
        JUMP: false, DASH: false, INTERACT: false, MENU: false, INVENTORY: false,
        CROUCH: false, LEAN_LEFT: false, LEAN_RIGHT: false, INSPECT: false, THROW_DROP: false,
        PRIMARY_ACTION: false, SECONDARY_ACTION: false, TOGGLE_CONSOLE: false, TOGGLE_PHOTO_MODE: false,
        TOGGLE_EDIT_MODE: false, ROTATE_OBJECT: false
    }
    // Previous frame state for "Just Pressed" detection
    private prevActions: { [key in ActionType]: boolean } = { ...this.actions }

    private axes: { [key in AxisType]: number } = {
        MOVE_X: 0, MOVE_Y: 0, LOOK_X: 0, LOOK_Y: 0
    }

    // External Inputs (Virtual Joystick)
    private virtualAxis: { x: number, y: number } = { x: 0, y: 0 }
    private virtualLook: { x: number, y: number } = { x: 0, y: 0 }

    // Mouse Delta
    private mouseDelta: { x: number, y: number } = { x: 0, y: 0 }

    // Frame locking
    private lastFrameTime: number = 0

    constructor() {
        this.bindEvents()
    }

    private bindEvents() {
        if (typeof window === 'undefined') return

        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true
            this.keys[e.code.toLowerCase()] = true
        })
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false
            this.keys[e.code.toLowerCase()] = false
        })

        // Mouse
        window.addEventListener('mousedown', (e) => {
            this.keys[`mouse${e.button}`] = true
        })
        window.addEventListener('mouseup', (e) => {
            this.keys[`mouse${e.button}`] = false
        })

        // Mouse Move (Delta)
        window.addEventListener('mousemove', (e) => {
            this.mouseDelta.x += e.movementX
            this.mouseDelta.y += e.movementY
        })

        // Disable context menu for right click gameplay
        window.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    // Call this ONCE per frame
    update() {
        const now = performance.now()
        if (now === this.lastFrameTime) return // Frame already processed
        this.lastFrameTime = now

        // Save previous state
        this.prevActions = { ...this.actions }

        // 1. Check Bindings
        for (const action in this.bindings) {
            const bindingKeys = this.bindings[action as ActionType]
            let isPressed = false
            for (const key of bindingKeys) {
                if (this.keys[key]) {
                    isPressed = true
                    break
                }
            }
            this.actions[action as ActionType] = isPressed
        }

        // 2. Axes Calculation (Keyboard)
        let kx = 0
        let ky = 0
        if (this.keys['w'] || this.keys['arrowup']) ky -= 1
        if (this.keys['s'] || this.keys['arrowdown']) ky += 1
        if (this.keys['a'] || this.keys['arrowleft']) kx -= 1
        if (this.keys['d'] || this.keys['arrowright']) kx += 1

        // 3. Gamepad (Simple Poll)
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : []
        let gx = 0
        let gy = 0
        let glx = 0
        let gly = 0

        if (gamepads[0]) {
            const gp = gamepads[0]

            // Helper: Radial Deadzone
            // Input: x, y, threshold -> Output: {x, y} (normalized 0..1 magnitude)
            const applyDeadzone = (x: number, y: number, threshold: number = 0.15) => {
                const len = Math.sqrt(x * x + y * y)
                if (len < threshold) return { x: 0, y: 0 }

                // Rescale the remaining range to 0..1
                const factor = (len - threshold) / (1 - threshold)
                // Normalize vector and multiply by factor
                // (x/len) * factor
                return {
                    x: (x / len) * factor,
                    y: (y / len) * factor
                }
            }

            // Helper: Response Curve (Exponential)
            // Input: val, power -> Output: val
            const applyCurve = (val: number, power: number = 2.2) => {
                return Math.sign(val) * Math.pow(Math.abs(val), power)
            }

            // Move Stick (Axes 0, 1)
            const moveRaw = applyDeadzone(gp.axes[0], gp.axes[1])
            gx = moveRaw.x
            gy = moveRaw.y

            // Look Stick (Axes 2, 3)
            const lookRaw = applyDeadzone(gp.axes[2], gp.axes[3])
            // Apply curve to look stick for precision
            glx = applyCurve(lookRaw.x, 2.2)
            gly = applyCurve(lookRaw.y, 2.2)

            if (gp.buttons[0].pressed) this.actions.JUMP = true
            if (gp.buttons[2].pressed) this.actions.INTERACT = true
            if (gp.buttons[1].pressed) this.actions.DASH = true
        }

        // 4. Combine Inputs (Clamp to length 1)
        let finalX = kx + gx + this.virtualAxis.x
        let finalY = ky + gy + this.virtualAxis.y

        // Normalize if length > 1
        const len = Math.sqrt(finalX * finalX + finalY * finalY)
        if (len > 1) {
            finalX /= len
            finalY /= len
        }

        this.axes.MOVE_X = finalX
        this.axes.MOVE_Y = finalY

        // 5. Look Axes (Mouse Delta + Gamepad + Virtual)
        // Sensitivity multipliers
        const MOUSE_SENSITIVITY = 0.002 // Radians per pixel approximately
        const GAMEPAD_LOOK_SPEED = 0.05 // Radians per frame

        // Combine (Accumulate mouse delta, but clear it after use? No, InputManager shouldn't clear, wait.
        // Usually InputManager provides "Delta this frame".
        // mouseDelta is accumulated since last update. We use it and reset it.)

        this.axes.LOOK_X = (this.mouseDelta.x * MOUSE_SENSITIVITY) + (glx * GAMEPAD_LOOK_SPEED) + this.virtualLook.x
        this.axes.LOOK_Y = (this.mouseDelta.y * MOUSE_SENSITIVITY) + (gly * GAMEPAD_LOOK_SPEED) + this.virtualLook.y

        // Reset mouse delta after consumption
        this.mouseDelta.x = 0
        this.mouseDelta.y = 0
    }

    // Public API
    getAxis(axis: AxisType): number {
        return this.axes[axis]
    }

    isPressed(action: ActionType): boolean {
        return this.actions[action]
    }

    justPressed(action: ActionType): boolean {
        return this.actions[action] && !this.prevActions[action]
    }

    // Virtual Joystick Integration
    setVirtualAxis(x: number, y: number) {
        this.virtualAxis.x = x
        this.virtualAxis.y = y
    }

    setVirtualLook(x: number, y: number) {
        this.virtualLook.x = x
        this.virtualLook.y = y
    }

    // Rebinding API
    rebind(action: ActionType, newKeys: string[]) {
        this.bindings[action] = newKeys
    }
}

const inputs = new InputManager()
export default inputs
