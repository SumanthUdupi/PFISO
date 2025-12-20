import React, { useEffect } from 'react';
import useGameStore, { SkillTier } from '../../store';

const UnlockEffect: React.FC = () => {
    // We can subscribe to store changes
    // But Zustand subscription is a bit manual inside components
    // A simpler way is to check if 'unlockedSkills' changed, but we need to know *which* one

    // Instead, let's just make a simple toast system that listens to a custom event
    // or we can add a 'lastUnlockedSkill' to the store state.

    // Let's rely on a transient state in the store or a custom event dispatch
    // For simplicity, let's modify the store to dispatch an event, or just handle it here?
    // Let's modify the store to have a 'recentUnlock' field

    const { unlockedSkills } = useGameStore();
    const [lastCount, setLastCount] = React.useState(0);
    const [notification, setNotification] = React.useState<{name: string, tier: SkillTier} | null>(null);

    useEffect(() => {
        const count = Object.keys(unlockedSkills).length;
        if (count > lastCount && lastCount > 0) {
            // Find the new skill?
            // Actually, comparing objects is hard.
            // Let's assume the store logic triggers a visual effect via a global custom event
            // OR we can just use the fact that this re-renders.

            // To be precise, we should really have an event system.
            // Dispatching a custom event from the store is clean.
        }
        setLastCount(count);
    }, [unlockedSkills, lastCount]);

    useEffect(() => {
        const handleUnlock = (e: CustomEvent) => {
            setNotification(e.detail);
            setTimeout(() => setNotification(null), 3000);

            // Play sound?
        };

        window.addEventListener('skill-unlocked', handleUnlock as EventListener);
        return () => window.removeEventListener('skill-unlocked', handleUnlock as EventListener);
    }, []);

    if (!notification) return null;

    return (
        <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            pointerEvents: 'none',
            textAlign: 'center'
        }}>
            <div style={{
                fontSize: '48px',
                animation: 'bounce 0.5s ease'
            }}>
                ✨
            </div>
            <div style={{
                background: 'rgba(0,0,0,0.8)',
                padding: '20px 40px',
                borderRadius: '8px',
                border: '4px solid #F1C40F',
                color: '#F1C40F',
                fontFamily: '"Press Start 2P", cursive',
                boxShadow: '0 0 20px rgba(241, 196, 15, 0.5)',
                animation: 'slideUp 0.3s ease'
            }}>
                <div style={{ fontSize: '12px', color: 'white', marginBottom: '10px' }}>SKILL UNLOCKED!</div>
                <div style={{ fontSize: '24px' }}>{notification.name}</div>
                <div style={{ fontSize: '12px', marginTop: '5px', color: '#ccc' }}>Rank: {notification.tier}</div>
            </div>
            <style>{`
                @keyframes bounce {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UnlockEffect;
