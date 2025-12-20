import React from 'react'

const UIOverlay = () => {
  // This component seems to be a placeholder or legacy overlay.
  // The actual game UI is handled within the Lobby scene or specific overlays.
  // We return null or an empty container to avoid blocking the view.
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      padding: '20px'
    }}>
      {/* Title removed to prevent obscuring the 3D scene on mobile */}
    </div>
  )
}

export default UIOverlay
