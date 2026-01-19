import React, { useEffect } from 'react'
import { useAchievementStore } from '../../systems/AchievementManager'
import { AnimatePresence, motion } from 'framer-motion'

const AchievementToast = () => {
    const { queue, popToast } = useAchievementStore()
    const currentToast = queue[0]

    useEffect(() => {
        if (currentToast) {
            const timer = setTimeout(() => {
                popToast()
            }, 3500) // Show for 3.5s
            return () => clearTimeout(timer)
        }
    }, [currentToast, popToast])

    return (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
            <AnimatePresence>
                {currentToast && (
                    <motion.div
                        key={currentToast.id}
                        initial={{ opacity: 0, x: 50, y: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 20, y: -200, scale: 0.8 }} // Fly up and away
                        transition={{ duration: 0.4, type: 'spring' }}
                        className="bg-[#2a2a2a] border border-[#d4a373] text-[#eaddcf] p-4 rounded-lg shadow-2xl flex items-center gap-4 min-w-[300px]"
                        style={{ fontFamily: '"Fredoka", sans-serif' }}
                    >
                        <div className="w-12 h-12 bg-[#d4a373] rounded-full flex items-center justify-center text-xl text-[#2a2a2a] font-bold">
                            🏆
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider text-[#d4a373]/80 font-bold mb-1">
                                Achievement Unlocked
                            </div>
                            <div className="font-bold text-lg leading-none mb-1">
                                {currentToast.title}
                            </div>
                            <div className="text-sm opacity-70">
                                {currentToast.description}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AchievementToast
