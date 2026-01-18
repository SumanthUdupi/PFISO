import { create } from 'zustand';

interface ControlsState {
  joystick: { x: number; y: number }; // x and y are between -1 and 1
  lookVector: { x: number; y: number };
  isActionPressed: boolean;
  isJumpPressed: boolean;
  isCrouchPressed: boolean;
  setJoystick: (x: number, y: number) => void;
  setLookVector: (x: number, y: number) => void;
  setActionPressed: (pressed: boolean) => void;
  setJumpPressed: (pressed: boolean) => void;
  setCrouchPressed: (pressed: boolean) => void;
}

const useControlsStore = create<ControlsState>((set) => ({
  joystick: { x: 0, y: 0 },
  lookVector: { x: 0, y: 0 },
  isActionPressed: false,
  isJumpPressed: false,
  isCrouchPressed: false,
  setJoystick: (x, y) => set({ joystick: { x, y } }),
  setLookVector: (x, y) => set({ lookVector: { x, y } }),
  setActionPressed: (pressed) => set({ isActionPressed: pressed }),
  setJumpPressed: (pressed) => set({ isJumpPressed: pressed }),
  setCrouchPressed: (pressed) => set({ isCrouchPressed: pressed }),
}));

export default useControlsStore;
