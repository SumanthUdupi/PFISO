import React from 'react'
import useGameStore from '../../store'
import { shallow } from 'zustand/shallow'

export const InteractionPrompt: React.FC = React.memo(() => {
    // Select only what we need. 
    // Note: If focusedObject.distance updates every frame, this specific component will still re-render often,
    // but at least it won't trigger the entire HUD to reconcile.
    const focusedObject = useGameStore(state => state.focusedObject)

    if (!focusedObject) return null

    // UX-021: Prompt Clarity & Fade
    const promptOpacity = Math.max(0, 1 - ((focusedObject.distance || 0) / 3))

    return (
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-8 flex flex-col items-center gap-1 transition-opacity duration-200"
            style={{ opacity: promptOpacity }}
        >
            <div className={`backdrop-blur-sm text-white px-3 py-1 rounded border font-bold flex items-center gap-2 ${focusedObject.locked ? 'bg-red-900/60 border-red-500' : 'bg-black/60 border-white/20'}`}>
                {focusedObject.locked ? (
                    <>
                        <span className="text-red-400 text-xs tracking-wider uppercase">[LOCKED]</span>
                        <span>{focusedObject.label}</span>
                    </>
                ) : (
                    <>
                        <span className="bg-white text-black px-1.5 rounded text-xs leading-none py-0.5">[E]</span>
                        <span>{focusedObject.verb || focusedObject.label}</span>
                    </>
                )}
            </div>
        </div>
    )
})
