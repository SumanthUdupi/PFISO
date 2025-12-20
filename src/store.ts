import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SkillTier = 'Locked' | 'Novice' | 'Proficient' | 'Master';

export interface GameState {
  // Core Progression
  viewedProjects: string[]; // List of project IDs
  unlockedSkills: Record<string, SkillTier>; // Skill Name -> Tier
  motesCollected: number;
  collectedMoteIds: number[]; // Track specific collected motes

  // Quest System
  currentObjective: string;
  isObjectiveComplete: boolean;

  // Actions
  unlockSkill: (skillName: string, tier: SkillTier) => void;
  markProjectViewed: (projectId: string) => void;
  collectMote: (id?: number) => void;
  setObjective: (objective: string) => void;
  resetProgress: () => void;
}

const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      viewedProjects: [],
      unlockedSkills: {},
      motesCollected: 0,
      collectedMoteIds: [],
      currentObjective: "Restore your skills by reviewing your past projects.",
      isObjectiveComplete: false,

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
        }
      },

      markProjectViewed: (projectId) => {
        if (!get().viewedProjects.includes(projectId)) {
          set((state) => ({ viewedProjects: [...state.viewedProjects, projectId] }));
        }
      },

      collectMote: (id) => set((state) => {
          if (id !== undefined && !state.collectedMoteIds.includes(id)) {
             return {
                 motesCollected: state.motesCollected + 1,
                 collectedMoteIds: [...state.collectedMoteIds, id]
             };
          } else if (id === undefined) {
             return { motesCollected: state.motesCollected + 1 };
          }
          return state;
      }),

      setObjective: (objective) => set({ currentObjective: objective, isObjectiveComplete: false }),

      resetProgress: () => set({
        viewedProjects: [],
        unlockedSkills: {},
        motesCollected: 0,
        currentObjective: "Restore your skills by reviewing your past projects.",
        isObjectiveComplete: false
      })
    }),
    {
      name: 'portfolio-game-storage', // unique name
    }
  )
);

export default useGameStore;
