import { create } from 'zustand';

interface AudioState {
    muted: boolean;
    volume: number;
    toggleMute: () => void;
    setVolume: (v: number) => void;
    playSound: (sound: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land') => void;
}

// Lazy AudioContext initialization
let audioCtx: AudioContext | null = null;

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

const playSynthSound = (type: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land', volume: number) => {
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
        }
    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

const useAudioStore = create<AudioState>((set, get) => ({
    muted: false,
    volume: 0.5,
    toggleMute: () => set((state) => ({ muted: !state.muted })),
    setVolume: (v) => set({ volume: v }),
    playSound: (type) => {
        const { muted, volume } = get();
        if (muted) return;
        playSynthSound(type, volume);
    }
}));

export default useAudioStore;
