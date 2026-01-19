import React from 'react'
import { useUIStore } from '../../stores/uiStore'

import Journal from './Journal'
import StaminaBar from './StaminaBar'
import { motion } from 'framer-motion'
import SubtitleOverlay from './SubtitleOverlay'

import { useDeviceDetect } from '../../hooks/useDeviceDetect'
import { useTranslation } from '../../hooks/useTranslation'
import { useGameStore } from '../../store'

export const HUD: React.FC = () => {
    const { toggleSkillsMenu, toggleSystemMenu, isJournalOpen, toggleJournal } = useUIStore()
    const { isMobile } = useDeviceDetect()
    const { t } = useTranslation()
    // Local state removed in favor of global store
    const { currentObjective } = useGameStore()

    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'j' || e.key === 'Tab') {
                e.preventDefault() // Prevent focus trapping with Tab
                toggleJournal()
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [toggleJournal])

    return (
        <>
            {isJournalOpen && <Journal onClose={toggleJournal} />}

            {isJournalOpen && <Journal onClose={toggleJournal} />}

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-[100]">
                {/* Top Right: Menu & Skills */}
                <div className="flex justify-end items-start gap-4 pointer-events-auto">
                    {/* Journal Button */}
                    <button
                        onClick={toggleJournal}
                        className="group flex flex-col items-center gap-1 transition-all active:scale-95"
                        aria-label="Journal"
                    >
                        <div className={`relative bg-cozy-bg/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 flex items-center justify-center text-2xl group-hover:bg-cozy-primary group-hover:text-cozy-text transition-all duration-300 ${isMobile ? 'w-14 h-14' : 'w-14 h-14'}`}>
                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="font-sans">📖</span>
                        </div>
                        {!isMobile && (
                            <span className="text-xs font-medium text-cozy-text/90 drop-shadow-sm bg-cozy-bg/90 backdrop-blur px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                Journal [J]
                            </span>
                        )}
                    </button>

                    <button
                        onClick={toggleSkillsMenu}
                        className="group flex flex-col items-center gap-1 transition-all active:scale-95"
                        aria-label="Skills Inventory"
                    >
                        <div className="relative w-14 h-14 bg-cozy-bg/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 flex items-center justify-center text-2xl group-hover:bg-cozy-primary group-hover:text-cozy-text transition-all duration-300">
                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="font-sans">✨</span>
                        </div>
                        <span className="text-xs font-medium text-cozy-text/90 drop-shadow-sm bg-cozy-bg/90 backdrop-blur px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                            Skills
                        </span>
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={toggleSystemMenu}
                        className="w-12 h-12 bg-cozy-bg/40 backdrop-blur-sm rounded-full border border-white/30 shadow-sm flex items-center justify-center text-lg text-cozy-text/70 hover:bg-cozy-bg/80 hover:text-cozy-text transition-all duration-300"
                        title="Settings"
                        aria-label="System Settings"
                    >
                        <span className="font-sans">⚙️</span>
                    </button>
                </div>

                {/* Bottom Left: Guidance / Objective */}
                <div className="flex flex-col items-start gap-4">
                    <StaminaBar />
                    <div className="bg-cozy-bg/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-sm border border-white/50 max-w-sm transform transition-all hover:scale-[1.02]">
                        <h3 className="text-[10px] uppercase tracking-[0.2em] text-cozy-text/60 font-bold mb-1">{t('hud.objective')}</h3>
                        <p className="text-lg text-cozy-text font-medium leading-tight font-sans" aria-live="polite">
                            {currentObjective}
                        </p>
                    </div>
                </div>
            </div>
            {/* SYS-035: Subtitles */}
            <SubtitleOverlay />

            {/* SYS-047: Tutorial Skip */}
            {/* Check store for tutorialActive */}
            {useGameStore(state => state.tutorialActive) && (
                <div className="absolute top-4 right-4 pointer-events-auto z-50">
                    <button
                        onClick={() => useGameStore.getState().skipTutorial()}
                        className="bg-black/50 text-white px-4 py-2 rounded border border-white/20 hover:bg-white/10 text-sm font-bold backdrop-blur-md transition-colors"
                    >
                        {t('hud.skipTutorial')} [P]
                    </button>
                </div>
            )}
        </>
    )
}
