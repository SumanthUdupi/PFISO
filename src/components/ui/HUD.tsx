import React from 'react'
import useGameStore from '../../store'

export const HUD = () => {
    const health = useGameStore(state => state.health)
    const score = useGameStore(state => state.motesCollected)
    const notifications = useGameStore(state => state.notifications)
    const gameState = useGameStore(state => state.gameState)

    if (gameState !== 'playing') return null

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none font-sans text-white p-5">
            {/* Top Bar */}
            <div className="flex justify-between items-center">
                {/* Health */}
                <div className="flex items-center gap-2">
                    <div className="w-[200px] h-5 bg-black/50 rounded-full overflow-hidden border border-white/20 backdrop-blur-sm">
                        <div
                            className={`h-full transition-all duration-300 ${health > 30 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${health}%` }}
                        />
                    </div>
                    <span className="font-bold drop-shadow-md text-lg font-mono">HP {Math.round(health)}</span>
                </div>

                {/* Score */}
                <div className="text-2xl font-black drop-shadow-md tracking-wider text-yellow-300">
                    {score} MOTES
                </div>
            </div>

            {/* Notifications */}
            <div className="absolute bottom-24 right-5 flex flex-col gap-3 items-end">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`bg-black/80 px-4 py-3 rounded-lg border-l-4 shadow-lg animate-in slide-in-from-right duration-300 ${n.type === 'error' ? 'border-red-500' : 'border-blue-500'}`}
                    >
                        <div className="font-bold text-sm tracking-wide">{n.title}</div>
                        <div className="text-xs opacity-80">{n.message}</div>
                    </div>
                ))}
            </div>

            {/* Instruction / Controls Hint */}
            <div className="absolute bottom-5 left-5 opacity-70 text-sm font-mono bg-black/40 px-3 py-1 rounded backdrop-blur-sm">
                WASD to Move | SPACE to Jump | SHIFT to Run | F to Interact
            </div>
        </div>
    )
}

export default HUD
