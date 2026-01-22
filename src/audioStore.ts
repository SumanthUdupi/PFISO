import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AudioState {
    audioCtx: AudioContext | null;
    muted: boolean;
    volume: number;
    audioContextReady: boolean;
    activeDialogueCount: number;
    addActiveVoice: () => void;
    removeActiveVoice: () => void;
    toggleMute: () => void;
    setVolume: (type: 'master' | 'music' | 'sfx' | 'voice', volume: number) => void;
    playSound: (sound: 'hover' | 'click' | 'unlock' | 'error' | 'jump' | 'land' | 'open_modal' | 'teleport' | 'success' | 'footstep') => void;
    startAmbient: () => void;
    stopAmbient: () => void;
    // AUD-048: Subwoofer / Bass Boost Logic
    bassBoost: boolean
    toggleBassBoost: () => void

    // AUD-050: Mute on Focus Loss
    muteOnFocusLoss: boolean
    toggleMuteOnFocusLoss: () => void

    initAudio: () => Promise<void>;
    setLoaded: (loaded: boolean) => void;
    isLoaded: boolean;
    playSynthSound: (type: string, volume: number) => void;
    // AUD-023
    mono: boolean;
    toggleMono: () => void;
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
const MAX_PER_TYPE = 2;

const playSynthSoundImpl = (type: string, volume: number) => {
    if (typeof window === 'undefined') return;

    try {
        const typeCount = activeVoices.get(type) || 0;
        if (typeCount >= MAX_PER_TYPE) return;

        const ctx = getAudioContext();
        if (!ctx || ctx.state !== 'running') return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        let duration = 0.1;

        // Simple synthesis fallback if SoundBank not used or for UI sounds
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
            // ... (keep implies synthesis for UI)
            default:
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                gain.gain.setValueAtTime(volume * 0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                duration = 0.1;
                break;
        }

        osc.start(now);
        osc.stop(now + duration);

        activeVoices.set(type, (activeVoices.get(type) || 0) + 1);
        osc.onended = () => {
            const count = activeVoices.get(type) || 1;
            activeVoices.set(type, Math.max(0, count - 1));
        };

    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

const COOLDOWNS: Record<string, number> = {
    footstep: 350,
    hover: 50,
    land: 500,
    jump: 200,
    click: 100
};

const lastPlayed = new Map<string, number>();

const useAudioStore = create<AudioState>()(
    persist(
        (set, get) => ({
            audioCtx: null,
            muted: false,
            volume: 0.5,
            audioContextReady: false,
            activeDialogueCount: 0,
            isLoaded: false,

            setloaded: (loaded) => set({ isLoaded: loaded }),

            addActiveVoice: () => set(state => ({ activeDialogueCount: state.activeDialogueCount + 1 })),
            removeActiveVoice: () => set(state => ({ activeDialogueCount: Math.max(0, state.activeDialogueCount - 1) })),

            setVolume: (v) => {
                set({ volume: v });
                if (ambientGain && audioCtx) ambientGain.gain.setValueAtTime(v * 0.05, audioCtx.currentTime);
            },

            bassBoost: false, // Default off
            muteOnFocusLoss: true, // Default on per standard practice

            mono: false,
            toggleMono: () => set((state) => {
                const newMono = !state.mono
                const ctx = getAudioContext()
                if (ctx) {
                    ctx.destination.channelCount = newMono ? 1 : 2
                }
                return { mono: newMono }
            }),

            toggleBassBoost: () => set((state) => ({ bassBoost: !state.bassBoost })),

            toggleMuteOnFocusLoss: () => set((state) => ({ muteOnFocusLoss: !state.muteOnFocusLoss })),

            toggleMute: () => set((state) => {
                const newMuted = !state.muted;
                const { stopAmbient, startAmbient } = get();
                if (newMuted) stopAmbient();
                else startAmbient();
                return { muted: newMuted };
            }),

            initAudio: async () => {
                const ctx = getAudioContext();
                if (ctx) {
                    set({ audioCtx: ctx });
                    // AUD-024: Master Limiter Logic
                    // Simple Mono enforcement on init
                    ctx.destination.channelCount = get().mono ? 1 : 2;

                    // AUD-050: Window Focus Logic
                    window.addEventListener('blur', () => {
                        const { muteOnFocusLoss, audioCtx } = get()
                        if (muteOnFocusLoss && audioCtx && audioCtx.state === 'running') {
                            audioCtx.suspend()
                        }
                    })
                    window.addEventListener('focus', () => {
                        const { audioCtx } = get()
                        if (audioCtx && audioCtx.state === 'suspended') {
                            audioCtx.resume()
                        }
                    })

                    if (ctx.state === 'suspended') {
                        try {
                            await ctx.resume();
                            set({ audioContextReady: true });
                            if (!get().muted) get().startAmbient();
                        } catch (e) {
                            console.warn("Audio resume failed", e);
                        }
                    } else if (ctx.state === 'running') {
                        set({ audioContextReady: true });
                    }
                }
            },

            playSynthSound: (type, volume) => {
                playSynthSoundImpl(type, volume);
            },

            playSound: (type) => {
                const { muted, volume } = get();
                if (muted) return;

                const now = Date.now();
                const last = lastPlayed.get(type) || 0;
                const cooldown = COOLDOWNS[type] || 0;

                if (now - last < cooldown) return;

                lastPlayed.set(type, now);
                playSynthSoundImpl(type, volume);
            },

            startAmbient: () => {
                if (typeof window === 'undefined') return;
                const { muted, volume } = get();
                if (muted) return;

                const ctx = getAudioContext();
                if (!ctx || ctx.state !== 'running') return;
                if (ambientOsc) return;

                try {
                    ambientOsc = ctx.createOscillator();
                    ambientOsc.type = 'sine';
                    ambientOsc.frequency.setValueAtTime(50, ctx.currentTime);

                    ambientGain = ctx.createGain();
                    ambientGain.gain.setValueAtTime(volume * 0.05, ctx.currentTime);

                    ambientOsc.connect(ambientGain);
                    ambientGain.connect(ctx.destination);
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
                    } catch (e) { }
                    ambientOsc = null;
                }
                if (ambientGain) {
                    ambientGain.disconnect();
                    ambientGain = null;
                }
            }
        }),
        {
            name: 'audio-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ volume: state.volume, muted: state.muted }),
        }
    )
);

export default useAudioStore;
