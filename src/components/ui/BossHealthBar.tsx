import React from 'react';
import useGameStore from '../../store';

const BossHealthBar: React.FC = () => {
    const boss = useGameStore(state => state.boss);

    if (!boss || !boss.visible) return null;

    const percent = (boss.health / boss.maxHealth) * 100;

    return (
        <div style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            maxWidth: '90vw',
            zIndex: 95, // Below HUD (100)
            pointerEvents: 'none'
        }}>
            <h3 style={{
                textAlign: 'center',
                color: '#ff5252',
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '20px',
                textShadow: '2px 2px 0 #000',
                marginBottom: '5px'
            }}>
                {boss.name.toUpperCase()}
            </h3>
            <div style={{
                width: '100%',
                height: '24px',
                background: '#330000',
                border: '4px solid #000',
                position: 'relative'
            }}>
                <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: '#ff1744',
                    transition: 'width 0.2s ease-out'
                }} />
            </div>
        </div>
    );
};

export default BossHealthBar;
