import React, { useState } from 'react'
import useGameStore from '../../store'
import useAudioStore from '../../audioStore'

const PauseMenu: React.FC = () => {
    const { isPaused, isInventoryOpen, togglePause, restartGame } = useGameStore()
    const { muted, toggleMute } = useAudioStore()
    const [confirmAction, setConfirmAction] = useState<'RESTART' | 'QUIT' | null>(null)

    // Don't show if inventory is open (it has its own overlay) or if not paused
    if (!isPaused || isInventoryOpen) return null

    const handleRestart = () => {
        setConfirmAction('RESTART')
    }

    const handleQuit = () => {
        setConfirmAction('QUIT')
    }

    const confirmSelection = () => {
        if (confirmAction === 'RESTART') {
            restartGame()
            togglePause() // Unpause after restart
        } else if (confirmAction === 'QUIT') {
            // Ideally return to main menu, for now just reload
            window.location.reload()
        }
        setConfirmAction(null)
    }

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-cozy-bg p-8 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full text-center transform transition-all scale-100">

                {confirmAction ? (
                    // UX-009: Confirmation Dialog
                    <div className="space-y-6 animate-in zoom-in-95 duration-200">
                        <h2 className="text-3xl font-black text-red-500 tracking-tight">CONFIRM ACTION</h2>
                        <p className="text-cozy-text/80 text-lg">
                            {confirmAction === 'RESTART' ? 'Lose unsaved progress and restart?' : 'Quit to desktop?'}
                        </p>
                        <div className="flex gap-4 justify-center pt-4">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={confirmSelection}
                                className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg hover:shadow-red-500/20 transition-all"
                            >
                                CONFIRM
                            </button>
                        </div>
                    </div>
                ) : (
                    // Main Pause Menu
                    <div className="flex flex-col gap-3">
                        <h1 className="text-5xl font-black text-cozy-text mb-8 tracking-tighter drop-shadow-sm">PAUSED</h1>

                        <button
                            onClick={togglePause}
                            className="w-full py-4 bg-cozy-primary text-white font-bold text-lg rounded-xl hover:bg-cozy-accent hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                        >
                            RESUME GAME
                        </button>

                        <button
                            onClick={toggleMute}
                            className="w-full py-3 bg-white/50 text-cozy-text font-bold rounded-xl hover:bg-white transition-colors"
                        >
                            {muted ? '🔇 UNMUTE AUDIO' : '🔊 MUTE AUDIO'}
                        </button>

                        <div className="h-px bg-black/10 my-2" />

                        <button
                            onClick={handleRestart}
                            className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                        >
                            RESTART LEVEL
                        </button>
                        <button
                            onClick={handleQuit}
                            className="w-full py-3 text-gray-500 font-bold hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            EXIT TO DESKTOP
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PauseMenu
