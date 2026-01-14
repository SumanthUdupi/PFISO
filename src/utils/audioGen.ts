import * as THREE from 'three'

// Types of sounds we can generate
export type SoundType = 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land' | 'open_modal' | 'teleport' | 'success'

/**
 * Generates an AudioBuffer for a specific sound type using OfflineAudioContext.
 * This allows us to "bake" procedural sounds into buffers that can be used by PositionalAudio.
 */
export const generateSoundBuffer = async (type: SoundType): Promise<AudioBuffer | null> => {
    // 1. Create Offline Context
    // Duration depends on sound, but 1s is usually enough for UI/SFX
    const duration = 1.0
    const sampleRate = 44100
    // Handle browser compatibility for OfflineContext if needed, though most modern browsers support it
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext
    if (!OfflineCtx) return null

    const ctx = new OfflineCtx(1, sampleRate * duration, sampleRate)

    // 2. Setup Synth Nodes
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = 0 // Start at 0 in offline context

    // 3. Define the sound (Logic copied/adapted from original audioStore.ts)
    switch (type) {
        case 'hover':
            osc.type = 'sine'
            osc.frequency.setValueAtTime(400, now)
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1)
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
            osc.start(now)
            osc.stop(now + 0.1)
            break
        case 'click':
            osc.type = 'square'
            osc.frequency.setValueAtTime(800, now)
            gain.gain.setValueAtTime(0.3, now)
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
            osc.start(now)
            osc.stop(now + 0.05)
            break
        case 'unlock':
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(400, now)
            osc.frequency.setValueAtTime(600, now + 0.1)
            osc.frequency.setValueAtTime(1000, now + 0.2)
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.6)
            osc.start(now)
            osc.stop(now + 0.6)
            break
        case 'error':
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(150, now)
            osc.frequency.linearRampToValueAtTime(100, now + 0.2)
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.2)
            osc.start(now)
            osc.stop(now + 0.2)
            break
        case 'jump':
            osc.type = 'sine'
            osc.frequency.setValueAtTime(200, now)
            osc.frequency.linearRampToValueAtTime(400, now + 0.1)
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.2)
            osc.start(now)
            osc.stop(now + 0.2)
            break
        case 'land':
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(100, now)
            osc.frequency.linearRampToValueAtTime(50, now + 0.1)
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.1)
            osc.start(now)
            osc.stop(now + 0.1)
            break
        case 'open_modal':
            osc.type = 'sine'
            osc.frequency.setValueAtTime(300, now)
            osc.frequency.linearRampToValueAtTime(500, now + 0.1)
            gain.gain.setValueAtTime(0.4, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.3)
            osc.start(now)
            osc.stop(now + 0.3)
            break
        case 'teleport':
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(200, now)
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.3)
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.4)
            osc.start(now)
            osc.stop(now + 0.4)
            break
        case 'success':
            osc.type = 'sine'
            osc.frequency.setValueAtTime(440, now) // A4
            osc.frequency.setValueAtTime(554, now + 0.1) // C#5
            gain.gain.setValueAtTime(0.5, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.5)
            osc.start(now)
            osc.stop(now + 0.5)
            break
    }

    // 4. Render
    return await ctx.startRendering()
}
