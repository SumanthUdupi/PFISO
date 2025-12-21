import { create } from 'zustand';

interface ControlsState {
  joystick: { x: number; y: number }; // x and y are between -1 and 1
  isActionPressed: boolean;
  setJoystick: (x: number, y: number) => void;
  setActionPressed: (pressed: boolean) => void;
}

const useControlsStore = create<ControlsState>((set) => ({
  joystick: { x: 0, y: 0 },
  isActionPressed: false,
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  setActionPressed: (pressed) => set({ isActionPressed: pressed }),
}));

export default useControlsStore;
