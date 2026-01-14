import * as THREE from 'three'

// MECH-044: Input Manager

export type ActionType = 'JUMP' | 'DASH' | 'INTERACT' | 'MENU'
export type AxisType = 'MOVE_X' | 'MOVE_Y' | 'LOOK_X' | 'LOOK_Y'

class InputManager {
    // State
    private keys: { [key: string]: boolean } = {}
    private actions: { [key in ActionType]: boolean } = {
        JUMP: false, DASH: false, INTERACT: false, MENU: false
    }
    // Previous frame state for "Just Pressed" detection
    private prevActions: { [key in ActionType]: boolean } = { ...this.actions }

    private axes: { [key in AxisType]: number } = {
        MOVE_X: 0, MOVE_Y: 0, LOOK_X: 0, LOOK_Y: 0
    }

    // External Inputs (Virtual Joystick)
    private virtualAxis: { x: number, y: number } = { x: 0, y: 0 }

    constructor() {
        this.bindEvents()
    }

    private bindEvents() {
        if (typeof window === 'undefined') return

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true
            this.keys[e.code] = true // Support both Key 'e' and Code 'KeyE'
        })
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false
            this.keys[e.code] = false
        })
    }

    // Call this at start of useFrame
    update() {
        // Save previous state
        this.prevActions = { ...this.actions }

        // 1. Keyboard Checks
        this.actions.JUMP = this.keys[' '] || this.keys['space'] || false
        this.actions.DASH = this.keys['shift'] || this.keys['shiftleft'] || this.keys['shiftright'] || false
        this.actions.INTERACT = this.keys['e'] || this.keys['enter'] || false
        this.actions.MENU = this.keys['escape'] || false

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
        if (gamepads[0]) {
            const gp = gamepads[0]
            if (Math.abs(gp.axes[0]) > 0.1) gx = gp.axes[0]
            if (Math.abs(gp.axes[1]) > 0.1) gy = gp.axes[1]
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
}

const inputs = new InputManager()
export default inputs
