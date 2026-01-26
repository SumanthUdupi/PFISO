import React, { useEffect, useState } from 'react'
import useGameStore from '../../store'
import { useUIStore } from '../../stores/uiStore'

const MainMenu: React.FC = () => {
    const { gameState, restartGame } = useGameStore()
    const { toggleSystemMenu } = useUIStore()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (gameState === 'menu') {
            setVisible(true)
        } else {
            setTimeout(() => setVisible(false), 500)
        }
    }, [gameState])

    if (!visible && gameState !== 'menu') return null

    const handleStart = () => {
        restartGame() // Sets state to 'playing'
    }

    return (
        <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center transition-opacity duration-1000 ${gameState === 'menu' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Background Gradient/Blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-sm -z-10" />

            <div className="flex flex-col items-center gap-8 transform transition-all duration-700">
                {/* Logo / Title */}
                <div className="text-center mb-12">
                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 to-yellow-600 drop-shadow-2xl tracking-tighter filter contrast-125">
                        PROJECT<br />ISO
                    </h1>
                    <p className="text-xl text-yellow-100/80 tracking-[0.5em] mt-4 font-light uppercase">
                        Atmospheric Platformer
                    </p>
                </div>

                {/* Menu Options */}
                <div className="flex flex-col gap-4 w-64">
                    <button
                        onClick={handleStart}
                        className="group relative px-8 py-4 bg-white text-black font-bold text-lg uppercase tracking-wider rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition-transform"
                    >
                        <span className="relative z-10">Start Journey</span>
                        <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <button
                        onClick={() => toggleSystemMenu()}
                        className="px-8 py-4 bg-black/40 text-white font-bold text-lg uppercase tracking-wider rounded-xl border border-white/10 hover:bg-black/60 hover:border-white/30 transition-all backdrop-blur-md"
                    >
                        Settings
                    </button>

                    <div className="text-xs text-white/30 text-center mt-8 font-mono">
                        v1.2.0 - Reforged Update
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MainMenu
