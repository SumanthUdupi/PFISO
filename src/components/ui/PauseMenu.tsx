import React, { useState } from 'react'
import useGameStore from '../../store'
import useAudioStore from '../../audioStore'

const PauseMenu: React.FC = () => {
    const { isPaused, isInventoryOpen, togglePause, restartGame } = useGameStore()
    const { isMuted, toggleMute } = useAudioStore()
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
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-cozy-bg p-8 rounded-xl border-4 border-cozy-text shadow-2xl max-w-sm w-full text-center">

                {confirmAction ? (
                    // UX-009: Confirmation Dialog
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-red-500">Are you sure?</h2>
                        <p className="text-cozy-text">
                            {confirmAction === 'RESTART' ? 'Unsaved progress will be lost.' : 'You will leave the game.'}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={confirmSelection}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 hover:scale-105 transition-transform"
                            >
                                CONFIRM
                            </button>
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-6 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-700 hover:scale-105 transition-transform"
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                ) : (
                    // Main Pause Menu
                    <>
                        <h1 className="text-4xl font-black text-cozy-text mb-8 tracking-tighter">PAUSED</h1>

                        <div className="space-y-4 flex flex-col items-center">
                            <button
                                onClick={togglePause}
                                className="w-full py-3 bg-cozy-primary text-white font-bold rounded hover:bg-cozy-accent hover:scale-105 transition-transform"
                            >
                                RESUME
                            </button>
                            <button
                                onClick={toggleMute}
                                className="w-full py-3 bg-white text-cozy-text border-2 border-cozy-primary font-bold rounded hover:bg-gray-100 transition-colors"
                            >
                                {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
                            </button>
                            <div className="h-4" /> {/* Spacer */}
                            <button
                                onClick={handleRestart}
                                className="w-full py-3 bg-red-500/20 text-red-500 border-2 border-red-500 font-bold rounded hover:bg-red-500 hover:text-white transition-colors"
                            >
                                RESTART LEVEL
                            </button>
                            <button
                                onClick={handleQuit}
                                className="w-full py-3 bg-transparent text-gray-500 font-bold hover:text-gray-300 transition-colors"
                            >
                                QUIT GAME
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default PauseMenu
