import React, { useState } from 'react'

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
      <div style={{
        backgroundColor: '#F0F0F0',
        padding: '4px',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80%',
        overflowY: 'auto',
        border: '4px solid #333',
        boxShadow: '8px 8px 0px #000',
        color: '#333'
      }}>
        <div style={{
          backgroundColor: '#4A90E2',
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          borderBottom: '4px solid #333',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: '#D0021B',
              border: '2px solid white',
              color: 'white',
              fontFamily: '"Press Start 2P", cursive',
              cursor: 'pointer',
              padding: '5px 10px'
            }}
          >
            X
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
