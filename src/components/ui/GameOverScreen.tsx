import React from 'react'
import useGameStore from '../../stores/gameStore'

const GameOverScreen: React.FC = () => {
    const { gameState, restartGame } = useGameStore()

    if (gameState === 'playing') return null

    const isVictory = gameState === 'won'

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isVictory ? 'rgba(76, 175, 80, 0.8)' : 'rgba(185, 28, 28, 0.9)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200, // Above everything
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h1 style={{
                fontSize: '64px',
                fontWeight: '900',
                marginBottom: '20px',
                letterSpacing: '5px',
                textTransform: 'uppercase',
                textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                color: isVictory ? '#FFD700' : '#000'
            }}>
                {isVictory ? 'Victory!' : 'You Died'}
            </h1>

            <p style={{
                fontSize: '24px',
                marginBottom: '50px',
                maxWidth: '600px',
                textAlign: 'center',
                lineHeight: '1.5'
            }}>
                {isVictory
                    ? "Mission Accomplished. You've secured the facility."
                    : "Critical Systems Failure. The facility has claimed another soul."}
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
                <button
                    onClick={() => {
                        restartGame()
                        // Reload page to ensure full reset for now (physics state etc)
                        // In a more complex app we'd proper reset everything, but reload is safer for jams
                        window.location.reload()
                    }}
                    style={{
                        padding: '20px 40px',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        background: '#fcf4e8',
                        color: '#222',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {isVictory ? 'Play Again' : 'Try Again'}
                </button>
            </div>
        </div>
    )
}

export default GameOverScreen
