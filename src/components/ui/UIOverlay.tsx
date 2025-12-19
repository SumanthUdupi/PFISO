import React from 'react'

const UIOverlay = () => {
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
      <h1 style={{ margin: 0, textShadow: '2px 2px 0px #000' }}>Interactive Portfolio</h1>
    </div>
  )
}

export default UIOverlay
