import React, { useState } from 'react'
import NineSlicePanel from './NineSlicePanel'

interface ModalProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div style={{
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
    }}>
      <NineSlicePanel style={{
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80%',
        display: 'flex',
        flexDirection: 'column',
        padding: 0, // Reset padding as NineSlicePanel handles the border/padding via slice
        backgroundColor: '#C0C0C0', // Match the NineSlice face
        color: '#333',
        boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          background: 'linear-gradient(to right, #000080, #1084d0)',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          fontFamily: '"Press Start 2P", cursive',
        }}>
          <h2 style={{ margin: 0, fontSize: '14px', textShadow: '2px 2px #000' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: '#C0C0C0',
              border: '2px outset #eee',
              color: 'black',
              fontFamily: '"Press Start 2P", cursive',
              cursor: 'pointer',
              padding: '2px 6px',
              fontSize: '12px',
              boxShadow: '1px 1px 0px #000'
            }}
          >
            X
          </button>
        </div>
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </NineSlicePanel>
    </div>
  )
}

export default Modal
