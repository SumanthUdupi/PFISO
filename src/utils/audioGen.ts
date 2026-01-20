
// Types of sounds we can generate
export type SoundType =
    | 'footstep_concrete' | 'footstep_wood' | 'footstep_metal' | 'footstep_tile'
    | 'jump' | 'land'
    | 'ui_hover' | 'ui_click' | 'unlock' | 'error' | 'open_modal' | 'teleport' | 'success'
    | 'ambient_office' | 'ambient_hallway' | 'ambient_wind'
    | 'music_explore' | 'music_tension' | 'music_menu' | 'heartbeat'
    | 'crackle' | 'breath_heavy' | 'ambient_water' | 'splash_enter' | 'splash_exit'
    | 'pickup' | 'rain' | 'ping' | 'rain_loop' | 'birdsong'
    | 'interact_door_open' | 'interact_door_close' | 'interact_drawer'
    | 'bullet_casing' | 'elevator_ding' | 'page_turn' | 'focus_enter' | 'focus_exit'

/**
 * Generates an AudioBuffer for a specific sound type using OfflineAudioContext.
 * This allows us to "bake" procedural sounds into buffers that can be used by PositionalAudio.
 */
export const generateSoundBuffer = async (type: SoundType): Promise<AudioBuffer | null> => {
    // 1. Create Offline Context
    // Duration depends on sound
    let duration = 1.0
    if (type.startsWith('ambient')) duration = 4.0 // Longer loops
    if (type.startsWith('footstep')) duration = 0.3

    const sampleRate = 44100
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext
    if (!OfflineCtx) return null

    const ctx = new OfflineCtx(1, sampleRate * duration, sampleRate)
    const now = 0 // Start at 0 in offline context

    // Helper: Create Noise Buffer
    const createNoise = (duration: number) => {
        const bufferSize = sampleRate * duration
        const buffer = ctx.createBuffer(1, bufferSize, sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }
        return buffer
    }

    // 2. Define the sound logic
    const osc = ctx.createOscillator() // Default osc
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    // For noise based sounds
    let noiseNode: AudioBufferSourceNode | null = null;
    let filter: BiquadFilterNode | null = null;

    switch (type) {
        // --- UI & SFX (Existing) ---
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

        // --- FOOTSTEPS ---
        case 'footstep_default':
        case 'footstep_concrete':
            // Sharp thud
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(0.2)
            filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(800, now)
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.3, now)
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
            noiseNode.start(now)
            break

        case 'footstep_carpet':
            // Muffled thud
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(0.2)
            filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(400, now) // Lower cutoff
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.2, now) // Quieter
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
            noiseNode.start(now)
            break

        case 'footstep_tile':
            // High frequency click + thud
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(0.2)
            filter = ctx.createBiquadFilter()
            filter.type = 'highpass' // Emphasis on click
            filter.frequency.setValueAtTime(1000, now)
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.4, now)
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
            noiseNode.start(now)
            break

        case 'footstep_wood':
            // Resonant thud
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(0.2)
            filter = ctx.createBiquadFilter()
            filter.type = 'bandpass'
            filter.frequency.setValueAtTime(300, now)
            filter.Q.value = 1.0 // Resonance
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.4, now)
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
            noiseNode.start(now)
            break

        // --- AMBIENCE ---
        case 'ambient_hvac':
            // Low rumble noise
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(duration)
            noiseNode.loop = true
            filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(150, now)
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.3, now)
            noiseNode.start(now)
            break

        case 'ambient_computer':
            // Mid-high fan noise
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(duration)
            noiseNode.loop = true
            filter = ctx.createBiquadFilter()
            filter.type = 'bandpass'
            filter.frequency.setValueAtTime(800, now)
            filter.Q.value = 2
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.15, now)
            noiseNode.start(now)
            break

        case 'ambient_office':
            // General room tone (very filtered noise)
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(duration)
            noiseNode.loop = true
            filter = ctx.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.setValueAtTime(300, now)
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.1, now)
            noiseNode.start(now)
            break

        // --- INTERACTIONS ---
        case 'interact_door_open':
            // Squeak + thud
            osc.type = 'sawtooth'
            osc.frequency.setValueAtTime(300, now)
            osc.frequency.linearRampToValueAtTime(100, now + 0.5)
            gain.gain.setValueAtTime(0.2, now)
            gain.gain.linearRampToValueAtTime(0, now + 0.5)
            osc.start(now)
            osc.stop(now + 0.5)
            break

        case 'interact_drawer':
            // Slide sound (white noise burst)
            noiseNode = ctx.createBufferSource()
            noiseNode.buffer = createNoise(0.4)
            filter = ctx.createBiquadFilter()
            filter.type = 'bandpass'
            filter.frequency.setValueAtTime(600, now)
            noiseNode.connect(filter)
            filter.connect(gain)
            gain.gain.setValueAtTime(0.2, now)
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
            noiseNode.start(now)
            break

        default:
            // Fallback beep
            osc.frequency.setValueAtTime(440, now)
            gain.gain.setValueAtTime(0.1, now)
            osc.start(now)
            osc.stop(now + 0.1)
            break
    }

    // 4. Render
    return await ctx.startRendering()
}

/**
 * Generates an Impulse Response buffer for Reverb (ConvolverNode)
 */
export const generateImpulseResponse = async (duration: number = 2.0, decay: number = 2.0): Promise<AudioBuffer | null> => {
    const sampleRate = 44100
    const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext
    if (!OfflineCtx) return null

    const ctx = new OfflineCtx(2, sampleRate * duration, sampleRate)
    const buffer = ctx.createBuffer(2, sampleRate * duration, sampleRate)
    const totalSamples = sampleRate * duration;

    // Left and Right channels
    for (let c = 0; c < 2; c++) {
        const channelData = buffer.getChannelData(c)

        switch (type) {
            case 'ambient_wind':
                // Low frequency noise with some movement
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    // Simple low-pass filtered noise
                    const noise = (Math.random() * 2 - 1);
                    // Apply a basic low-pass filter effect (very simplified)
                    // This is a very basic approximation, a real filter would be more complex
                    const b0 = 0.05; // Coefficient for current sample
                    const a1 = -0.9; // Coefficient for previous output
                    // This is not a proper IIR filter, just a simple smoothing for demonstration
                    channelData[i] = (noise * b0) + (i > 0 ? channelData[i - 1] * a1 : 0);
                    channelData[i] *= 0.1; // Reduce volume
                }
                break;
            case 'music_explore':
                // Slow Pad (Sine waves)
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    // Simple chord CMaj7 (C, E, G, B)
                    channelData[i] = (Math.sin(t * 261.63 * Math.PI * 2) + Math.sin(t * 329.63 * Math.PI * 2) + Math.sin(t * 392.00 * Math.PI * 2) + Math.sin(t * 493.88 * Math.PI * 2)) * 0.1
                }
                break;
            case 'music_tension':
                // Dissonant / Fast
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    // Dissonant Trill (e.g., C and C#)
                    channelData[i] = (Math.sin(t * 261.63 * Math.PI * 2) + Math.sin(t * 277.18 * Math.PI * 2) * Math.sin(t * 10)) * 0.1
                }
                break;
            case 'rain':
                // Pink noise loop
                for (let i = 0; i < totalSamples; i++) {
                    const white = Math.random() * 2 - 1;
                    channelData[i] = white * 0.1;
                }
                break;
            case 'ping':
                // High clear sine ping
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    const env = Math.exp(-5 * t)
                    channelData[i] = Math.sin(t * 880 * Math.PI * 2) * env * 0.5 +
                        Math.sin(t * 1760 * Math.PI * 2) * env * 0.25;
                }
                break;
            case 'birdsong':
                // FM Chirp
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    const mod = Math.sin(t * 50 * Math.PI * 2) * 500; // Modulator
                    const env = Math.exp(-10 * t) * (1 - Math.exp(-100 * t)); // Attack-Decay
                    channelData[i] = Math.sin((t * 2000 + mod) * Math.PI * 2) * env * 0.3;
                }
                break;
            case 'bullet_casing':
                // Metallic Ping/Clatter
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    // High freq metallic ring
                    const ring = Math.sin(t * 3000 * Math.PI * 2) * Math.exp(-20 * t);
                    // Initial impact click
                    const click = (Math.random() * 2 - 1) * Math.exp(-200 * t);
                    channelData[i] = (ring * 0.6 + click * 0.4) * 0.5;
                }
                break;
            case 'elevator_ding':
                // Classic Bell
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    // Sine + subtle harmonic
                    const ding = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-2 * t) +
                        Math.sin(t * 1600 * Math.PI * 2) * Math.exp(-4 * t) * 0.2;
                    channelData[i] = ding * 0.5;
                }
                break;
            case 'page_turn':
                // Filtered Noise Swipe
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    // White noise
                    const noise = Math.random() * 2 - 1;
                    // Envelope acts as the "swipe" duration
                    const env = Math.sin(Math.PI * (t / 0.5)) // roughly 0.5s duration logic if duration matches
                    if (t > 0.4) { channelData[i] = 0; continue; }
                    channelData[i] = noise * env * 0.5;
                    // Ideally this needs a filter, but for raw buffer we rely on simple amplitude shaping
                    // A real page turn implies frequency sweep. We can simulate with phase cancellation or just simple noise.
                }
                break;
            case 'focus_enter':
                // Reverse-like swell or low thrum
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    const freq = 100 + t * 400; // Rising
                    channelData[i] = Math.sin(t * freq * Math.PI * 2) * Math.min(1, t * 4) * 0.5
                }
                break;
            case 'focus_exit':
                // Falling thrum
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / sampleRate;
                    const freq = 500 - t * 400; // Falling
                    channelData[i] = Math.sin(t * freq * Math.PI * 2) * Math.exp(-5 * t) * 0.5
                }
                break;
            default:
                // Default Impulse Response (Reverb)
                for (let i = 0; i < channelData.length; i++) {
                    // Noise
                    const noise = (Math.random() * 2 - 1)
                    // Exponential decay
                    const impulse = noise * Math.pow(1 - i / channelData.length, decay)
                    channelData[i] = impulse
                }
                break;
        }

        // AUD-010: Loop Pop Fix (Micro-fades)
        // Apply fade in/out to all ambient/music tracks to ensure zero-crossing at loop points
        if (type.startsWith('ambient') || type.startsWith('music')) {
            const fadeSamples = Math.floor(sampleRate * 0.05) // 50ms fade
            for (let i = 0; i < fadeSamples; i++) {
                const gain = i / fadeSamples
                channelData[i] *= gain
                channelData[totalSamples - 1 - i] *= gain
            }
        }
    }

    return buffer
}
