import { create } from 'zustand';

interface AudioState {
    muted: boolean;
    volume: number;
    audioContextReady: boolean;
    toggleMute: () => void;
    setVolume: (v: number) => void;
    playSound: (sound: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land' | 'open_modal' | 'teleport' | 'success' | 'footstep') => void;
    startAmbient: () => void;
    stopAmbient: () => void;
    initAudio: () => Promise<void>;
}

// Lazy AudioContext initialization
let audioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

const getAudioContext = () => {
    if (!audioCtx && typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    return audioCtx;
};

// SYS-034: Audio Stacking Limit
const activeVoices = new Map<string, number>();
const MAX_VOICES = 5; // Global max
const MAX_PER_TYPE = 2; // Limit per sound type (e.g. 2 footsteps)

const playSynthSound = (type: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land' | 'open_modal' | 'teleport' | 'success' | 'footstep', volume: number) => {
    if (typeof window === 'undefined') return;

    try {
        const typeCount = activeVoices.get(type) || 0;
        if (typeCount >= MAX_PER_TYPE) return;

        const ctx = getAudioContext();
        if (!ctx || ctx.state !== 'running') return; // Don't play if not ready

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        let duration = 0.1; // Default

        switch (type) {
            case 'hover':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                duration = 0.1;
                break;
            case 'click':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                duration = 0.05;
                break;
            case 'unlock':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(600, now + 0.1);
                osc.frequency.setValueAtTime(1000, now + 0.2);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                duration = 0.6;
                break;
            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                duration = 0.2;
                break;
            case 'jump':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                duration = 0.2;
                break;
            case 'land':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                duration = 0.1;
                break;
            case 'open_modal':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(500, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                duration = 0.3;
                break;
            case 'teleport':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                duration = 0.4;
                break;
            case 'success':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554, now + 0.1); // C#5
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                duration = 0.5;
                break;
            case 'footstep':
                // Short, low thud/click
                osc.type = 'square'; // or triangle for softer
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
                gain.gain.setValueAtTime(volume * 0.1, now); // Quiet
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                duration = 0.05;
                break;
        }

        osc.start(now);
        osc.stop(now + duration);

        // Track voice
        activeVoices.set(type, (activeVoices.get(type) || 0) + 1);
        osc.onended = () => {
            const count = activeVoices.get(type) || 1;
            activeVoices.set(type, Math.max(0, count - 1));
        };

    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

// Audio Cooldowns to prevent spam (ms)
const COOLDOWNS: Record<string, number> = {
    footstep: 350,   // Increased to match walk cycle speed better
    hover: 50,       // Very short, just avoids double-triggers
    land: 500,       // Only once per impact
    jump: 200,
    click: 100
};

const lastPlayed = new Map<string, number>();

const useAudioStore = create<AudioState>((set, get) => ({
    muted: false,
    volume: parseFloat(localStorage.getItem('setting_masterVolume') || '0.5'),
    audioContextReady: false,
    toggleMute: () => {
        const newMuted = !get().muted;
        set({ muted: newMuted });
        if (newMuted) get().stopAmbient();
        else get().startAmbient();
    },
    setVolume: (v) => {
        set({ volume: v });
        localStorage.setItem('setting_masterVolume', v.toString());
        if (ambientGain && audioCtx) ambientGain.gain.setValueAtTime(v * 0.05, audioCtx.currentTime);
    },
    initAudio: async () => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            try {
                await ctx.resume();
                set({ audioContextReady: true });
                // If not muted, start ambient now
                if (!get().muted) {
                    get().startAmbient();
                }
            } catch (e) {
                console.warn("Audio resume failed", e);
            }
        } else if (ctx && ctx.state === 'running') {
            set({ audioContextReady: true });
        }
    },
    playSound: (type) => {
        const { muted, volume } = get();
        if (muted) return;

        // Cooldown Check
        const now = Date.now();
        const last = lastPlayed.get(type) || 0;
        const cooldown = COOLDOWNS[type] || 0;

        if (now - last < cooldown) return;

        lastPlayed.set(type, now);
        playSynthSound(type, volume);
    },
    startAmbient: () => {
        if (typeof window === 'undefined') return;
        const { muted } = get();
        if (muted) return;

        const ctx = getAudioContext();

        // If context isn't ready or suspended, try to resume if we supposedly initialized, 
        // else wait for user interaction (handled by initAudio)
        if (!ctx) return;

        if (ctx.state !== 'running') {
            // Can't start yet
            return;
        }

        if (ambientOsc) return; // Already playing

        try {
            // Soft low pad
            ambientOsc = ctx.createOscillator();
            ambientOsc.type = 'sine';
            ambientOsc.frequency.setValueAtTime(50, ctx.currentTime);

            ambientGain = ctx.createGain();
            ambientGain.gain.setValueAtTime(get().volume * 0.05, ctx.currentTime); // Very quiet

            ambientOsc.connect(ambientGain);
            ambientGain.connect(ctx.destination);

            // SYS-046: Seamless Loop - Oscillators are naturally continuous. 
            // If using samples later, we would use AudioBufferSourceNode with loop = true.
            ambientOsc.start();
        } catch (e) {
            console.warn("Failed to start ambient audio", e);
        }
    },
    stopAmbient: () => {
        if (ambientOsc) {
            try {
                ambientOsc.stop();
                ambientOsc.disconnect();
            } catch (e) { /* ignore */ }
            ambientOsc = null;
        }
        if (ambientGain) {
            ambientGain.disconnect();
            ambientGain = null;
        }
    }
}));

export default useAudioStore;
