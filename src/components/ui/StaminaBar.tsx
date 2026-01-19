
import React from 'react'
import useGameStore from '../../store'
import { motion, AnimatePresence } from 'framer-motion'

const StaminaBar: React.FC = () => {
    // Subscribe to store updates
    const stamina = useGameStore(state => state.stamina)
    const maxStamina = useGameStore(state => state.maxStamina)

    // Only show if slightly drained (optional, but good for immersion)
    // Or always show. Let's always show for clear feedback as per requirement.
    const percentage = (stamina / maxStamina) * 100

    return (
        <div className="bg-black/40 backdrop-blur-sm rounded-full h-2 w-48 overflow-hidden border border-white/20 shadow-sm relative">
            <motion.div
                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                initial={{ width: '100%' }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.1 }}
            />
            {/* Low stamina warning tint */}
            {percentage < 20 && (
                <motion.div
                    className="absolute inset-0 bg-red-500/30"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                />
            )}
        </div>
    )
}

export default StaminaBar
