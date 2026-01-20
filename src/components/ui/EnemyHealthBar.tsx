import React from 'react'
import { useGameStore } from '../../store'

interface EnemyHealthBarProps {
    x?: number
    y?: number
    name: string
    health: number
    maxHealth: number
    visible?: boolean
    level?: number
}

// NOTE: In a real implementation, this would likely be rendered multiple times or 
// project 3D positions to 2D. For this 'Generic' component, we accept screen coordinates 
// or default to centering for a "Boss" bar style if no coordinates are provided.

export const EnemyHealthBar: React.FC<EnemyHealthBarProps> = ({
    x, y, name, health, maxHealth, visible = true, level
}) => {

    if (!visible) return null

    // Percentage
    const pct = Math.max(0, Math.min(100, (health / maxHealth) * 100))

    // If no x/y provided, treat as Boss Bar (Top Center)
    const isBoss = x === undefined || y === undefined

    if (isBoss) {
        return (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] max-w-[90vw] flex flex-col gap-1 pointer-events-none z-[90]">
                {/* Header */}
                <div className="flex justify-between items-end px-1">
                    <span className="text-white font-bold text-lg tracking-widest uppercase drop-shadow-md">{name}</span>
                    <span className="text-red-500 font-bold text-sm tracking-wider">{Math.round(health)}/{maxHealth}</span>
                </div>
                {/* Bar Container */}
                <div className="w-full h-3 bg-black/60 border-2 border-white/20 rounded-full overflow-hidden backdrop-blur-sm relative">
                    {/* Background fill */}
                    <div className="absolute inset-0 bg-red-900/40" />
                    {/* Active fill */}
                    <div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out relative"
                        style={{ width: `${pct}%` }}
                    >
                        {/* Shine effect */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent" />
                    </div>
                </div>
            </div>
        )
    }

    // Floating Bar (e.g. above enemy head)
    return (
        <div
            className="absolute pointer-events-none z-[80] flex flex-col items-center gap-1"
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
        >
            <div className="flex items-center gap-2">
                {level && <span className="bg-red-900 text-white text-[10px] px-1 rounded font-bold">{level}</span>}
                <span className="text-white text-xs font-bold uppercase drop-shadow-md tracking-wider">{name}</span>
            </div>
            <div className="w-24 h-1.5 bg-black/60 border border-white/20 rounded-full overflow-hidden">
                <div
                    className="h-full bg-red-500 transition-all duration-200"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    )
}
