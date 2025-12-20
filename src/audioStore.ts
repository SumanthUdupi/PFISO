import { create } from 'zustand';

interface AudioState {
    muted: boolean;
    volume: number;
    toggleMute: () => void;
    setVolume: (v: number) => void;
    playSound: (sound: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land' | 'open_modal' | 'teleport' | 'success') => void;
    startAmbient: () => void;
    stopAmbient: () => void;
}

// Lazy AudioContext initialization
let audioCtx: AudioContext | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

const getAudioContext = () => {
    if (!audioCtx) {
        // Handle browser compatibility
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    // Resume if suspended (browser autoplay policy)
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const playSynthSound = (type: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land' | 'open_modal' | 'teleport' | 'success', volume: number) => {
    if (typeof window === 'undefined') return;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'hover':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'click':
                osc.type = 'square';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'unlock':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(600, now + 0.1);
                osc.frequency.setValueAtTime(1000, now + 0.2);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'jump':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
             case 'land':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'open_modal':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(500, now + 0.1);
                gain.gain.setValueAtTime(volume * 0.15, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'teleport':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'success':
                 osc.type = 'sine';
                 osc.frequency.setValueAtTime(440, now); // A4
                 osc.frequency.setValueAtTime(554, now + 0.1); // C#5
                 gain.gain.setValueAtTime(volume * 0.2, now);
                 gain.gain.linearRampToValueAtTime(0, now + 0.5);
                 osc.start(now);
                 osc.stop(now + 0.5);
                 break;
        }
    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

const useAudioStore = create<AudioState>((set, get) => ({
    muted: false,
    volume: 0.5,
    toggleMute: () => {
        const newMuted = !get().muted;
        set({ muted: newMuted });
        if (newMuted) get().stopAmbient();
        else get().startAmbient();
    },
    setVolume: (v) => {
        set({ volume: v });
        if (ambientGain) ambientGain.gain.setValueAtTime(v * 0.05, audioCtx!.currentTime);
    },
    playSound: (type) => {
        const { muted, volume } = get();
        if (muted) return;
        playSynthSound(type, volume);
    },
    startAmbient: () => {
        if (typeof window === 'undefined') return;
        const ctx = getAudioContext();
        if (!ctx || ambientOsc) return;

        // Soft low pad
        ambientOsc = ctx.createOscillator();
        ambientOsc.type = 'sine';
        ambientOsc.frequency.setValueAtTime(50, ctx.currentTime);

        ambientGain = ctx.createGain();
        ambientGain.gain.setValueAtTime(get().volume * 0.05, ctx.currentTime); // Very quiet

        ambientOsc.connect(ambientGain);
        ambientGain.connect(ctx.destination);
        ambientOsc.start();

        // Add subtle LFO for movement? Not for now, keep it simple.
    },
    stopAmbient: () => {
        if (ambientOsc) {
            ambientOsc.stop();
            ambientOsc.disconnect();
            ambientOsc = null;
        }
        if (ambientGain) {
            ambientGain.disconnect();
            ambientGain = null;
        }
    }
}));

export default useAudioStore;
