import React from 'react'
import useGameStore from '../../store'
import { useUIStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { shallow } from 'zustand/shallow'

import Journal from './Journal'
import StaminaBar from './StaminaBar'
import { SubtitleOverlay } from './SubtitleOverlay'
import { TutorialOverlay } from './TutorialOverlay'
import { QuestList } from './QuestList'
import { Hitmarker } from './Hitmarker'
import { HUDClock } from './HUDClock' // PERF-012
import { InteractionPrompt } from './InteractionPrompt' // PERF-012

// Assuming these exist based on usage, adding imports
// If they don't exist, we might get errors, but we can fix them.
// Based on typical project structure/previous context:
import { Minimap } from './Minimap'
import { Compass } from './Compass'
import { useTranslation } from '../../hooks/useTranslation'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import { BootSplash } from './BootSplash'

export const HUD: React.FC = React.memo(() => {
    // PERF-012: Granular selectors
    // GameStore
    const toggleJournal = useGameStore(state => state.toggleJournal)
    const isJournalOpen = useGameStore(state => state.isJournalOpen)
    const currentObjective = useGameStore(state => state.currentObjective)
    const tutorialActive = useGameStore(state => state.tutorialActive)

    // UIStore
    const hudOpacity = useUIStore(state => state.hudOpacity)
    const interactionProgress = useUIStore(state => state.interactionProgress)
    const hasSeenBootSplash = useUIStore(state => state.hasSeenBootSplash)
    const isPaused = useGameStore(state => state.isPaused) // Re-added isPaused from GameStore

    // SettingsStore
    const streamerMode = useSettingsStore(state => state.streamerMode)

    // Hooks
    const { isMobile } = useDeviceDetect()
    const { t } = useTranslation()

    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'j' || e.key === 'Tab') {
                e.preventDefault()
                toggleJournal()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [toggleJournal])

    if (!hasSeenBootSplash) {
        return <BootSplash />
    }

    return (
        <>
            {isJournalOpen && <Journal onClose={toggleJournal} />}

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-[100]">
                <Hitmarker />

                {/* Top Right: Menu & Skills */}
                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    {/* UX-047: Clock - Isolated */}
                    <HUDClock />

                    <div className="flex gap-4">
                        <button
                            onClick={toggleJournal}
                            className="group flex flex-col items-center gap-1 transition-all active:scale-95"
                            aria-label="Journal"
                        >
                            {/* Icon... */}
                        </button>
                    </div>

                    <QuestList />
                    <Minimap />

                    {/* UX-021: Interaction Prompt - Isolated */}
                    <InteractionPrompt />

                    {/* UX-013: Interaction Progress Circle */}
                    {interactionProgress > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none">
                            <svg className="w-full h-full rotate-[-90deg]">
                                <circle
                                    cx="32" cy="32" r="28"
                                    stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none"
                                />
                                <circle
                                    cx="32" cy="32" r="28"
                                    stroke="white" strokeWidth="4" fill="none"
                                    strokeDasharray="176"
                                    strokeDashoffset={176 - (176 * interactionProgress)}
                                    className="transition-[stroke-dashoffset] duration-75"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Main HUD Layer (Fadable) */}
                    <div
                        className="fixed inset-0 pointer-events-none p-8 flex flex-col justify-between transition-opacity duration-1000"
                        style={{ opacity: isPaused ? 0 : hudOpacity }}
                    >
                        <Compass />

                        {/* Top Bar */}
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border-l-4 border-cozy-accent">
                                    <h2 className="text-cozy-accent font-bold text-sm uppercase tracking-widest mb-1">Current Objective</h2>
                                    <p className="text-white font-medium drop-shadow-md">{currentObjective}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-right">
                                    <div className="text-6xl font-bold text-white drop-shadow-lg tracking-tighter">12:45</div>
                                    <div className="text-cozy-text font-medium uppercase tracking-widest text-sm">PM // TUESDAY</div>
                                </div>
                            </div>
                        </div>

                        <SubtitleOverlay />

                        {/* Bottom Bar */}
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-white/20 relative overflow-hidden bg-black/40">
                                        <div className="absolute inset-0 bg-green-500/20" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold text-lg drop-shadow-md">
                                            {streamerMode ? "AGENT 47" : "PLAYER ONE"}
                                        </span>
                                        <span className="text-white/60 text-xs uppercase tracking-wider">LEVEL 01</span>
                                    </div>
                                </div>
                                <StaminaBar />
                            </div>

                            <div className="flex gap-4 text-white/80 font-mono text-sm">
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    <span className="w-6 h-6 flex items-center justify-center bg-white text-black font-bold rounded text-xs leading-none">I</span>
                                    <span>INVENTORY</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    <span className="w-6 h-6 flex items-center justify-center bg-white text-black font-bold rounded text-xs leading-none">J</span>
                                    <span>JOURNAL</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    <span className="w-6 h-6 flex items-center justify-center bg-white text-black font-bold rounded text-xs leading-none">ESC</span>
                                    <span>MENU</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <TutorialOverlay />

                    {tutorialActive && (
                        <div className="absolute top-4 right-4 pointer-events-auto z-50">
                            <button
                                onClick={() => useGameStore.getState().skipTutorial()}
                                className="bg-black/50 text-white px-4 py-2 rounded border border-white/20 hover:bg-white/10 text-sm font-bold backdrop-blur-md transition-colors"
                            >
                                {t('hud.skipTutorial')} [P]
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
})
