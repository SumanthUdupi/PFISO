import React, { useState } from 'react'
import NineSlicePanel from './NineSlicePanel'
import { useDeviceDetect } from '../../hooks/useDeviceDetect'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  const { isMobile } = useDeviceDetect()

  if (!isOpen) return null

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
      backgroundColor: '#C0C0C0',
      color: '#333',
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
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'all',
      zIndex: 1000
  }

  const desktopPanelStyle: React.CSSProperties = {
      width: '80%',
      maxWidth: '600px',
      maxHeight: '80%',
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      backgroundColor: '#C0C0C0',
      color: '#333',
      boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
  }

  return (
    <div style={isMobile ? mobileContainerStyle : desktopContainerStyle}>
      <NineSlicePanel style={isMobile ? mobilePanelStyle : desktopPanelStyle}>
        <div style={{
          background: 'linear-gradient(to right, #000080, #1084d0)',
          padding: '12px 16px', // Larger touch target
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          fontFamily: '"Press Start 2P", cursive',
        }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '16px' : '14px', textShadow: '2px 2px #000' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: '#C0C0C0',
              border: '2px outset #eee',
              color: 'black',
              fontFamily: '"Press Start 2P", cursive',
              cursor: 'pointer',
              padding: isMobile ? '8px 12px' : '2px 6px', // Larger touch target (min 44px check via padding+content usually)
              minWidth: isMobile ? '44px' : 'auto',
              minHeight: isMobile ? '44px' : 'auto',
              fontSize: '12px',
              boxShadow: '1px 1px 0px #000',
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
  )
}

export default Modal
