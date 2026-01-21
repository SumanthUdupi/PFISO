import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NineSlicePanel from './NineSlicePanel'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, maxWidth }) => {
  const { isMobile } = useDeviceDetect()

  // Mobile Styles: Bottom Sheet
  const mobileContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end', // Align to bottom
    pointerEvents: 'all',
    zIndex: 1000
  }

  const mobilePanelStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    height: '85%', // Take up most of screen
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    backgroundColor: 'var(--color-ui-bg)',
    color: 'var(--color-ui-text)',
    boxShadow: '0 -4px 10px rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }

  // Desktop Styles: Centered
  const desktopContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(47, 79, 79, 0.4)', // Dimmed cozy-text
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'all',
    zIndex: 1000
  }

  const desktopPanelStyle: React.CSSProperties = {
    width: '80%',
    maxWidth: maxWidth || '600px',
    maxHeight: '80%',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    backgroundColor: 'var(--color-ui-bg)',
    color: 'var(--color-ui-text)',
    boxShadow: '8px 8px 0px rgba(0,0,0,0.2)',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={isMobile ? mobileContainerStyle : desktopContainerStyle}
        >
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.8, opacity: 0 }}
            animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={isMobile ? { y: '100%' } : { scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', pointerEvents: 'none' }}
          >
            <div
              style={{ pointerEvents: 'auto', ... (isMobile ? mobilePanelStyle : desktopPanelStyle), width: isMobile ? '100%' : (maxWidth || '600px'), maxHeight: isMobile ? '85%' : '80%' }}
              onWheel={(e) => e.stopPropagation()} // Stop zoom on scroll
              onPointerDown={(e) => e.stopPropagation()} // Stop click-through
            >
              <NineSlicePanel style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  background: 'var(--color-primary-glow)',
                  padding: '12px 16px', // Larger touch target
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'white',
                  fontFamily: '"Press Start 2P", cursive',
                }}>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '14px', textShadow: '1px 1px rgba(0,0,0,0.2)' }}>{title}</h2>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontFamily: '"Press Start 2P", cursive',
                      cursor: 'pointer',
                      padding: isMobile ? '8px 12px' : '2px 6px',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    X
                  </button>
                </div>
                <div style={{
                  padding: '20px',
                  overflowY: 'auto',
                  flex: 1,
                  fontSize: isMobile ? '16px' : 'inherit' // Ensure text scaling
                }}>
                  {children}
                </div>
              </NineSlicePanel>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal
