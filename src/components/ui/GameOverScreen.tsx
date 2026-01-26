import React, { useEffect, useState } from 'react'
import useGameStore from '../../store'
import { useTranslation } from '../../hooks/useTranslation'

const GameOverScreen: React.FC = () => {
    const { gameState, restartGame } = useGameStore()
    const { t } = useTranslation()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (gameState !== 'playing') {
            const timer = setTimeout(() => setVisible(true), 100)
            return () => clearTimeout(timer)
        } else {
            setVisible(false)
        }
    }, [gameState])

    if (gameState === 'playing') return null

    const isVictory = gameState === 'won'

    return (
        <div className={`fixed inset-0 z-[300] flex flex-col items-center justify-center transition-all duration-1000 ${visible ? 'bg-black/80 backdrop-blur-md opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`}>
            <div className={`transform transition-all duration-700 delay-100 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className={`text-6xl md:text-8xl font-black tracking-widest uppercase mb-6 text-center drop-shadow-lg ${isVictory ? 'text-yellow-400' : 'text-red-600'}`}>
                    {isVictory ? t('game.title') : t('gameover.title')}
                </h1>

                <p className="text-xl md:text-2xl text-white/90 text-center max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                    {isVictory
                        ? "Mission Accomplished. You've secured the facility."
                        : "Critical Systems Failure. The facility has claimed another soul."}
                </p>

                <div className="flex justify-center gap-6">
                    <button
                        onClick={() => {
                            restartGame()
                            window.location.reload()
                        }}
                        className="group relative px-8 py-4 bg-white text-black font-bold text-xl uppercase tracking-wider rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                    >
                        <span className="relative z-10">{t('gameover.respawn')}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GameOverScreen
