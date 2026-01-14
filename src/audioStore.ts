import { create } from 'zustand';

interface AudioState {
    muted: boolean;
    volume: number;
    toggleMute: () => void;
    setVolume: (v: number) => void;
}

const useAudioStore = create<AudioState>((set) => ({
    muted: false,
    volume: 0.5,
    toggleMute: () => set((state) => ({ muted: !state.muted })),
    setVolume: (v) => set({ volume: v }),
}));

export default useAudioStore;
