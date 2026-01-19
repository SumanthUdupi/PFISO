import { create } from 'zustand';
import { trackEvent } from './utils/analytics';
import eventBus from './systems/EventBus'
import { saveManager } from './systems/SaveManager';



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

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  steps: { id: string, description: string, isComplete: boolean }[];
}

export interface GameState {
  // Core Progression
  viewedProjects: string[]; // List of project IDs
  unlockedSkills: Record<string, SkillTier>; // Skill Name -> Tier
  motesCollected: number;
  collectedMoteIds: number[]; // Track specific collected motes

  // Quest System
  quests: Quest[];
  currentObjective: string; // Keep for simple display
  isObjectiveComplete: boolean;
  addQuest: (quest: Quest) => void;
  updateQuest: (id: string, updates: Partial<Quest>) => void;
  completeQuest: (id: string) => void;

  // ... imports need to be checked if I need to add one, but I can assume I can do it separately or here if I see the top.
  // I will just use full replace for sections.

  // SYS-039: Stats
  stats: {
    timePlayed: number; // in seconds
    stepsTaken: number;
    distanceTraveled: number;
  };
  incrementStats: (dt: number, dist: number) => void;

  // SYS-040: NPC State Persistence
  npcStates: Record<string, { hasTalked: boolean; dialogStage: number }>;
  updateNpcState: (id: string, updates: Partial<{ hasTalked: boolean; dialogStage: number }>) => void;

  // SYS-043: Boss Health Bar
  boss: { name: string; health: number; maxHealth: number; visible: boolean } | null;
  setBoss: (boss: { name: string; health: number; maxHealth: number; visible: boolean } | null) => void;
  updateBossHealth: (health: number) => void;

  // SYS-045: Sensitivity Settings
  sensitivityX: number;
  sensitivityY: number;
  setSensitivity: (x: number, y: number) => void;

  // SYS-047: Tutorial Skip
  tutorialActive: boolean;
  skipTutorial: () => void;

  // SYS-050: Performance Mode
  qualityMode: 'low' | 'high';
  setQualityMode: (mode: 'low' | 'high') => void;

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
  // SYS-027: Difficulty Modes
  difficulty: 'easy' | 'normal' | 'hard';
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;

  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;

  // Low Health Vignette or similar can trigger from health changes

  // Stamina System
  stamina: number; // 0-100
  maxStamina: number;
  setStamina: (val: number) => void;

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
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  resetProgress: () => void;

  // Autosave
  lastAutoSave: number;
  triggerAutoSave: () => void;
  isSaving: boolean;

  // SYS-023: Game Over State
  gameState: 'playing' | 'won' | 'lost';
  setVictory: () => void;
  setGameOver: () => void;
  restartGame: () => void;

  // SYS-024 & SYS-025: Inventory System
  items: string[];
  maxInventorySize: number;
  addItem: (id: string) => boolean; // Returns true if added, false if full
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  sortInventory: () => void;
}

const useGameStore = create<GameState>()((set, get) => ({
  viewedProjects: [],
  unlockedSkills: {},
  motesCollected: 0,
  collectedMoteIds: [],
  quests: [],
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
  stamina: 100,
  maxStamina: 100,
  // Autosave
  lastAutoSave: 0,
  isSaving: false,

  // SYS-039: Stats
  stats: {
    timePlayed: 0,
    stepsTaken: 0,
    distanceTraveled: 0
  },
  incrementStats: (dt, dist) => set((state) => ({
    stats: {
      ...state.stats,
      timePlayed: state.stats.timePlayed + dt,
      distanceTraveled: state.stats.distanceTraveled + dist,
      stepsTaken: state.stats.stepsTaken + (dist > 0 ? 1 : 0) // Approximation
    }
  })),

  // SYS-040: NPC State
  npcStates: {},
  updateNpcState: (id, updates) => set((state) => ({
    npcStates: {
      ...state.npcStates,
      [id]: { ...state.npcStates[id], ...updates }
    }
  })),

  // SYS-043: Boss Health
  boss: null,
  setBoss: (boss) => set({ boss }),
  updateBossHealth: (health) => set((state) => state.boss ? { boss: { ...state.boss, health } } : state),

  // SYS-045: Sensitivity Settings
  sensitivityX: 1.0,
  sensitivityY: 1.0,
  setSensitivity: (x, y) => set({ sensitivityX: x, sensitivityY: y }),

  // SYS-047: Tutorial Skip
  tutorialActive: true,
  skipTutorial: () => set({ tutorialActive: false }),

  // SYS-050: Performance Mode
  qualityMode: 'high',
  setQualityMode: (mode) => set({ qualityMode: mode }),

  // SYS-027: Difficulty Modes
  difficulty: 'normal',
  setDifficulty: (difficulty) => set({ difficulty }),

  // SYS-023: Game Over State
  gameState: 'playing',
  setVictory: () => set({ gameState: 'won', isPaused: true }),
  setGameOver: () => set({ gameState: 'lost', isPaused: true }),
  restartGame: () => set({
    gameState: 'playing',
    health: 100,
    stamina: 100,
    isPaused: false,
    isInventoryOpen: false,
    gameEnded: false,
    items: [], // Reset inventory
    activeBuffs: []
  }),

  // SYS-024 & SYS-025: Inventory System
  items: [],
  maxInventorySize: 20, // Cap at 20 items (SYS-024)
  addItem: (id) => {
    const state = get();
    if (state.items.length >= state.maxInventorySize) {
      // Inventory Full notification could be triggered here or in UI
      return false;
    }
    if (state.items.includes(id)) return true; // Already have it, treat as success or ignore

    set({ items: [...state.items, id] });
    setTimeout(() => get().triggerAutoSave(), 0);
    return true;
  },
  removeItem: (id) => {
    set((state) => ({ items: state.items.filter(i => i !== id) }));
    setTimeout(() => get().triggerAutoSave(), 0);
  },
  hasItem: (id) => get().items.includes(id),
  sortInventory: () => {
    set((state) => ({
      items: [...state.items].sort((a, b) => a.localeCompare(b))
    }));
  },

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
  togglePause: () => {
    const nextState = !get().isPaused;
    set({ isPaused: nextState });
    if (nextState) {
      document.exitPointerLock();
      set({ cursorType: 'DEFAULT' });
    }
  },
  toggleInventory: () => {
    const nextState = !get().isInventoryOpen;
    set({ isInventoryOpen: nextState });
    if (nextState) {
      document.exitPointerLock();
      set({ cursorType: 'DEFAULT' });
    }
  },

  setStamina: (val) => set({ stamina: val }),
  takeDamage: (amount) => {
    set((state) => {
      // Apply difficulty multiplier
      let multiplier = 1.0;
      switch (state.difficulty) {
        case 'easy': multiplier = 0.5; break;
        case 'hard': multiplier = 1.5; break;
      }
      const actualDamage = amount * multiplier;

      const newHealth = Math.max(0, state.health - actualDamage)
      if (newHealth <= 0 && state.gameState === 'playing') {
        return { health: newHealth, gameState: 'lost', isPaused: true }
      }
      return { health: newHealth }
    })
    eventBus.emit('DAMAGE', { amount }) // PM-030
    eventBus.emit('SCREEN_SHAKE', { intensity: 0.5 })

    // SYS-029: Rumble
    // Importing dynamically to avoid circular dependency issues if any, or just use imported singleton
    import('./systems/InputManager').then(({ default: inputs }) => {
      inputs.vibrate(Math.min(1.0, amount / 20), 300)
    })
  },
  heal: (amount) => {
    set((state) => ({ health: Math.min(100, state.health + amount) }))
    eventBus.emit('HEAL', { amount })
  },

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

      setTimeout(() => get().triggerAutoSave(), 0);
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
      setTimeout(() => get().triggerAutoSave(), 0); // Save after state update
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

  setObjective: (objective) => {
    set({ currentObjective: objective, isObjectiveComplete: false });
    setTimeout(() => get().triggerAutoSave(), 0);
  },

  addQuest: (quest) => set((state) => {
    if (state.quests.some(q => q.id === quest.id)) return state;
    const newState = { quests: [...state.quests, quest] };
    setTimeout(() => get().triggerAutoSave(), 0);
    return newState;
  }),

  updateQuest: (id, updates) => set((state) => {
    const newState = {
      quests: state.quests.map(q => q.id === id ? { ...q, ...updates } : q)
    };
    setTimeout(() => get().triggerAutoSave(), 0);
    return newState;
  }),

  completeQuest: (id) => set((state) => {
    const newState = {
      quests: state.quests.map(q => q.id === id ? { ...q, status: 'completed' } : q)
    };
    setTimeout(() => get().triggerAutoSave(), 0);
    return newState;
  }),

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

  triggerAutoSave: () => {
    const now = Date.now();
    const state = get();
    // Auto-save if more than 5 seconds since last save
    if (now - state.lastAutoSave > 5000) {
      get().saveGame();
    }
  },

  saveGame: async () => {
    set({ isSaving: true });
    const state = get();
    const toSave = {
      viewedProjects: state.viewedProjects,
      unlockedSkills: state.unlockedSkills,
      motesCollected: state.motesCollected,
      collectedMoteIds: state.collectedMoteIds,
      quests: state.quests,
      currentObjective: state.currentObjective,
      isObjectiveComplete: state.isObjectiveComplete,
      journalEntries: state.journalEntries,
      unlockedMemories: state.unlockedMemories,
      gameEnded: state.gameEnded,
      activeBuffs: state.activeBuffs,
      enableNavigationSuggestions: state.enableNavigationSuggestions,
      hasShownSurvey: state.hasShownSurvey,
      worldObjectStates: state.worldObjectStates,
      patrolPaths: state.patrolPaths,
      items: state.items // Save inventory items
    };

    try {
      await saveManager.save('gameState', toSave);
      set({ lastAutoSave: Date.now(), isSaving: false });
      console.log('Game saved successfully');
    } catch (e) {
      console.error('Failed to save game', e);
      set({ isSaving: false });
    }
  },

  loadGame: async () => {
    set({ isSaving: true });
    try {
      const saved = await saveManager.load<Partial<GameState>>('gameState');
      if (saved) {
        set({ ...saved, isSaving: false });
        console.log('Game loaded successfully');
      } else {
        set({ isSaving: false });
      }
    } catch (e) {
      console.error('Failed to load game state', e);
      set({ isSaving: false });
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
    patrolPaths: {},
    items: []
  })
})
);

export default useGameStore;
