
interface BaseStats {
    health: number;
    damage: number;
    xpReward: number;
}

export const LevelScalingSystem = {
    // UX-044: Dynamic Level Scaling
    getScaledStats: (baseStats: BaseStats, playerLevel: number): BaseStats => {
        // Simple scaling formula: 10% increase per level above 1
        // Cap scaling to prevent absurdity if needed
        const scaleFactor = 1 + (Math.max(0, playerLevel - 1) * 0.1);

        return {
            health: Math.floor(baseStats.health * scaleFactor),
            damage: Math.floor(baseStats.damage * scaleFactor),
            xpReward: Math.floor(baseStats.xpReward * scaleFactor)
        };
    },

    getDifficultyMultiplier: (difficulty: 'easy' | 'normal' | 'hard'): number => {
        switch (difficulty) {
            case 'easy': return 0.8;
            case 'hard': return 1.5;
            default: return 1.0;
        }
    }
};
