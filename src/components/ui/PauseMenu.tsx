import React from 'react'
import useGameStore from '../../store'
import useAudioStore from '../../audioStore'

const PauseMenu: React.FC = () => {
    const { isPaused, isInventoryOpen, togglePause } = useGameStore()
    const { toggleMute } = useAudioStore()

    // Don't show if inventory is open (it has its own overlay) or if not paused
    if (!isPaused || isInventoryOpen) return null

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            justifyContent: 'center',
            zIndex: 200,
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h1 style={{
                fontSize: '48px',
                fontWeight: '900',
                marginBottom: '40px',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                textShadow: '0 4px 0 rgba(0,0,0,0.5)'
            }}>
                Paused
            </h1>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                width: '300px'
            }}>
                <button
                    onClick={togglePause}
                    style={{
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        background: '#fcf4e8',
                        color: '#222',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    Resume
                </button>

                <button
                    onClick={toggleMute}
                    style={{
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        background: 'transparent',
                        color: '#fcf4e8',
                        border: '2px solid #fcf4e8',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    Toggle Audio
                </button>

                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: '2px solid #ef4444',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                >
                    Restart Level
                </button>
            </div>
        </div>
    )
}

export default PauseMenu
