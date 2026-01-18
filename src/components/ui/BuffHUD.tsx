import React, { useEffect, useState } from 'react'
import useGameStore, { Buff } from '../../store'

export const BuffHUD: React.FC = () => {
    const activeBuffs = useGameStore(state => state.activeBuffs)
    const updateBuffs = useGameStore(state => state.updateBuffs)

    // Force re-render for progress bars
    const [_, setTick] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            updateBuffs(Date.now())
            setTick(t => t + 1)
        }, 100)
        return () => clearInterval(interval)
    }, [updateBuffs])

    if (activeBuffs.length === 0) return null

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none',
            userSelect: 'none'
        }}>
            {activeBuffs.map(buff => (
                <BuffItem key={buff.id} buff={buff} />
            ))}
        </div>
    )
}

const BuffItem: React.FC<{ buff: Buff }> = ({ buff }) => {
    const elapsed = (Date.now() - buff.startTime) / 1000
    const remaining = Math.max(0, buff.duration - elapsed)
    const progress = Math.min(1, remaining / buff.duration)

    return (
        <div style={{
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'white',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '150px'
        }}>
            {/* Icon / Emoji based on buff type */}
            <div style={{ fontSize: '24px' }}>
                {getBuffIcon(buff.name)}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {buff.name}
                </div>
                {/* Progress Bar */}
                <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress * 100}%`,
                        height: '100%',
                        background: '#ffd700', // Gold color
                        transition: 'width 0.1s linear'
                    }} />
                </div>
                <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.7 }}>
                    {remaining.toFixed(1)}s
                </div>
            </div>
        </div>
    )
}

const getBuffIcon = (name: string) => {
    if (name.toLowerCase().includes('coffee')) return '☕'
    if (name.toLowerCase().includes('speed')) return '⚡'
    if (name.toLowerCase().includes('jump')) return '🦘'
    return '✨'
}
