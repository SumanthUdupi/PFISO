import { create } from 'zustand';
import { trackEvent } from './utils/analytics';


export type SkillTier = 'Locked' | 'Novice' | 'Proficient' | 'Master';

export interface Buff {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  startTime: number;
  effects: {
    movementSpeed?: number; // multiplier
    // add more effects as needed
  };
}

export interface GameState {
  // Core Progression
  viewedProjects: string[]; // List of project IDs
  unlockedSkills: Record<string, SkillTier>; // Skill Name -> Tier
  motesCollected: number;
  collectedMoteIds: number[]; // Track specific collected motes

  // Quest System
  currentObjective: string;
  isObjectiveComplete: boolean;

  // Journal & Gamification
  journalEntries: { id: string; title: string; description: string; date: string; stickers: string[] }[];
  unlockedMemories: string[]; // IDs of audio logs
  gameEnded: boolean;

  // Cozy Systems
  activeBuffs: Buff[];

  // Interaction
  focusedObject: { id: string; label: string; type?: 'pickup' | 'seat' | 'npc' | 'other'; position?: any } | null;
  setFocusedObject: (obj: { id: string; label: string; type?: 'pickup' | 'seat' | 'npc' | 'other'; position?: any } | null) => void;

  // World Persistence
  worldObjectStates: Record<string, { position: [number, number, number], rotation: [number, number, number, number] }>;
  updateWorldObject: (id: string, position: [number, number, number], rotation: [number, number, number, number]) => void;

  // AI Patrol Paths
  patrolPaths: Record<string, { points: [number, number, number][] }>;
  updatePatrolPath: (id: string, points: [number, number, number][]) => void;


  // Cursor State
  cursorType: 'DEFAULT' | 'HOVER' | 'GRAB' | 'TALK' | 'SIT';
  setCursorType: (type: 'DEFAULT' | 'HOVER' | 'GRAB' | 'TALK' | 'SIT') => void;

  // Progression
  experience: number;
  health: number; // 0-100
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;

  // Combat/Hotbar
  activeSlot: number; // 0-3
  slots: string[]; // Item IDs
  setActiveSlot: (slot: number) => void;
  setSlotItem: (slot: number, itemId: string) => void;

  // Settings
  enableNavigationSuggestions: boolean;
  hasShownSurvey: boolean;

  debugFlags: {
    showNavMesh: boolean;
    showPhysics: boolean;
    showFPS: boolean;
  };

  // Actions
  unlockSkill: (skillName: string, tier: SkillTier) => void;
  markProjectViewed: (projectId: string) => void;
  collectMote: (id?: number) => void;
  setObjective: (objective: string) => void;
  addJournalEntry: (entry: { id: string; title: string; description: string; stickers?: string[] }) => void;
  unlockMemory: (memoryId: string) => void;
  setGameEnded: (ended: boolean) => void;

  // Photo Mode
  isPhotoMode: boolean;
  togglePhotoMode: () => void;

  // Edit Mode
  isEditMode: boolean;
  toggleEditMode: () => void;

  isPaused: boolean;
  isInventoryOpen: boolean;
  isConsoleOpen: boolean;
  togglePause: () => void;
  toggleInventory: () => void;

  addBuff: (buff: Omit<Buff, 'startTime'>) => void;
  removeBuff: (id: string) => void;
  updateBuffs: (currentTime: number) => void;
  toggleNavigationSuggestions: () => void;
  setHasShownSurvey: () => void;
  saveGame: () => void;
  loadGame: () => void;
  resetProgress: () => void;
}

const useGameStore = create<GameState>()((set, get) => ({
  viewedProjects: [],
  unlockedSkills: {},
  motesCollected: 0,
  collectedMoteIds: [],
  currentObjective: "Restore your skills by reviewing your past projects.",
  isObjectiveComplete: false,
  journalEntries: [],
  unlockedMemories: [],
  gameEnded: false,
  activeBuffs: [],
  focusedObject: null,
  enableNavigationSuggestions: false,
  hasShownSurvey: false,
  experience: 0, // Initialize experience
  health: 100,
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
  heal: (amount) => set((state) => ({ health: Math.min(100, state.health + amount) })),
  // Initialize cursorType
  cursorType: 'DEFAULT',

  // Debug Init
  isConsoleOpen: false,
  debugFlags: {
    showNavMesh: false,
    showPhysics: false,
    showFPS: false
  },

  // Combat/Hotbar
  activeSlot: 0,
  slots: ['hands', 'camera', '', ''], // Default slots
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  setSlotItem: (slot, itemId) => set((state) => {
    const newSlots = [...state.slots];
    newSlots[slot] = itemId;
    return { slots: newSlots };
  }),

  // Photo Mode
  isPhotoMode: false,
  togglePhotoMode: () => set((state) => ({ isPhotoMode: !state.isPhotoMode })),

  // Edit Mode (Grid Placement)
  isEditMode: false,
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

  // Game System / UI States
  isPaused: false,
  isInventoryOpen: false,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleInventory: () => set((state) => ({ isInventoryOpen: !state.isInventoryOpen })),

  // World Persistence
  worldObjectStates: {},
  updateWorldObject: (id, position, rotation) => {
    set((state) => ({
      worldObjectStates: {
        ...state.worldObjectStates,
        [id]: { position, rotation }
      }
    }))
    // Debounce save or save immediately? 
    // For now, let's rely on manual save or auto-save triggers, 
    // but to be safe we can trigger a debounced save here if needed.
    // Actually, let's just update state. Real saving happens in saveGame().
  },

  // Patrol Paths
  patrolPaths: {},
  updatePatrolPath: (id, points) => {
    set((state) => ({
      patrolPaths: {
        ...state.patrolPaths,
        [id]: { points }
      }
    }))
    // Debounced save could go here
    setTimeout(() => get().saveGame(), 1000)
  },

  setFocusedObject: (obj) => set({ focusedObject: obj }),


  setCursorType: (type) => {
    // Only update if changed to prevent re-renders
    if (get().cursorType !== type) {
      set({ cursorType: type })
    }
  },

  toggleConsole: () => set((state) => ({ isConsoleOpen: !state.isConsoleOpen })),
  setDebugFlag: (flag, value) => set((state) => ({
    debugFlags: { ...state.debugFlags, [flag]: value }
  })),

  setExperience: (exp) => set({ experience: exp }),

  unlockSkill: (skillName, tier) => {
    const currentTier = get().unlockedSkills[skillName] || 'Locked';

    // Define hierarchy: Locked < Novice < Proficient < Master
    const tierValue = { 'Locked': 0, 'Novice': 1, 'Proficient': 2, 'Master': 3 };

    if (tierValue[tier] > tierValue[currentTier]) {
      set((state) => ({
        unlockedSkills: { ...state.unlockedSkills, [skillName]: tier }
      }));

      // Trigger global event for FX
      window.dispatchEvent(new CustomEvent('skill-unlocked', {
        detail: { name: skillName, tier }
      }));

      setTimeout(() => get().saveGame(), 0);
    }
  },

  markProjectViewed: (projectId) => {
    if (!get().viewedProjects.includes(projectId)) {
      set((state) => ({ viewedProjects: [...state.viewedProjects, projectId] }));
    }
  },

  collectMote: (id) => set((state) => {
    if (id !== undefined && !state.collectedMoteIds.includes(id)) {
      const newState = {
        motesCollected: state.motesCollected + 1,
        collectedMoteIds: [...state.collectedMoteIds, id]
      };
      setTimeout(() => get().saveGame(), 0); // Save after state update
      trackEvent('collect_mote');
      return newState;
    } else if (id === undefined) {
      const newState = { motesCollected: state.motesCollected + 1 };
      setTimeout(() => get().saveGame(), 0);
      trackEvent('collect_mote');
      return newState;
    }
    return state;
  }),

  setObjective: (objective) => set({ currentObjective: objective, isObjectiveComplete: false }),

  addJournalEntry: (entry) => set((state) => {
    if (state.journalEntries.some(e => e.id === entry.id)) return state;
    return {
      journalEntries: [...state.journalEntries, { ...entry, date: new Date().toLocaleDateString(), stickers: entry.stickers || [] }]
    };
  }),

  unlockMemory: (memoryId) => set((state) => {
    if (state.unlockedMemories.includes(memoryId)) return state;
    return { unlockedMemories: [...state.unlockedMemories, memoryId] };
  }),

  setGameEnded: (ended) => set({ gameEnded: ended }),

  addBuff: (buff) => set((state) => {
    const newBuff: Buff = { ...buff, startTime: Date.now() };
    return { activeBuffs: [...state.activeBuffs, newBuff] };
  }),

  removeBuff: (id) => set((state) => ({
    activeBuffs: state.activeBuffs.filter(buff => buff.id !== id)
  })),

  updateBuffs: (currentTime) => set((state) => {
    const expiredBuffs = state.activeBuffs.filter(buff =>
      (currentTime - buff.startTime) / 1000 >= buff.duration
    );
    if (expiredBuffs.length > 0) {
      return { activeBuffs: state.activeBuffs.filter(buff => !expiredBuffs.includes(buff)) };
    }
    return state;
  }),

  toggleNavigationSuggestions: () => set((state) => ({ enableNavigationSuggestions: !state.enableNavigationSuggestions })),

  setHasShownSurvey: () => set({ hasShownSurvey: true }),

  saveGame: () => {
    const state = get();
    const toSave = {
      viewedProjects: state.viewedProjects,
      unlockedSkills: state.unlockedSkills,
      motesCollected: state.motesCollected,
      collectedMoteIds: state.collectedMoteIds,
      currentObjective: state.currentObjective,
      isObjectiveComplete: state.isObjectiveComplete,
      journalEntries: state.journalEntries,
      unlockedMemories: state.unlockedMemories,
      gameEnded: state.gameEnded,
      activeBuffs: state.activeBuffs,
      enableNavigationSuggestions: state.enableNavigationSuggestions,
      hasShownSurvey: state.hasShownSurvey,
      worldObjectStates: state.worldObjectStates,
      patrolPaths: state.patrolPaths
    };
    localStorage.setItem('gameState', JSON.stringify(toSave));
  },

  loadGame: () => {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        set(parsed);
      } catch (e) {
        console.error('Failed to load game state', e);
      }
    }
  },

  resetProgress: () => set({
    viewedProjects: [],
    unlockedSkills: {},
    motesCollected: 0,
    currentObjective: "Restore your skills by reviewing your past projects.",
    isObjectiveComplete: false,
    journalEntries: [],
    unlockedMemories: [],
    activeBuffs: [],
    enableNavigationSuggestions: false,
    hasShownSurvey: false,
    worldObjectStates: {},
    patrolPaths: {}
  })
})
);

export default useGameStore;
