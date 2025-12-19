import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FlashOverlayProps {
  trigger: boolean
  onComplete?: () => void
}

const FlashOverlay: React.FC<FlashOverlayProps> = ({ trigger, onComplete }) => {
  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  return (
    <AnimatePresence>
      {trigger && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            zIndex: 9999,
            pointerEvents: 'none',
            mixBlendMode: 'screen'
          }}
        />
      )}
    </AnimatePresence>
  )
}

export default FlashOverlay
