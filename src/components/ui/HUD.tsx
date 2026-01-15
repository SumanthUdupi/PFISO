import React from 'react'
import useGameStore from '../../stores/gameStore'
import useInventoryStore from '../../stores/inventoryStore'

const HUD: React.FC = () => {
    const { health, maxHealth, score } = useGameStore()
    const { items } = useInventoryStore()

    // Calculate health percentage
    const healthPercent = (health / maxHealth) * 100

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Allow clicks to pass through to canvas
            zIndex: 10,
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* CROSSHAIR */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 4px rgba(0,0,0,0.5)',
                border: '1px solid rgba(0,0,0,0.5)'
            }} />

            {/* HEALTH BAR (Bottom Left) */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px'
            }}>
                <div style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Health {health}
                </div>
                <div style={{
                    width: '200px',
                    height: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <div style={{
                        width: `${healthPercent}%`,
                        height: '100%',
                        background: health > 30 ? '#4ade80' : '#ef4444', // Green or Red warning
                        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                </div>
            </div>

            {/* INVENTORY (Bottom Right) */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                display: 'flex',
                gap: '10px'
            }}>
                {items.map((item, index) => (
                    <div key={index} style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                    }}>
                        {/* Placeholder Icon */}
                        KEY
                    </div>
                ))}
            </div>

            {/* SCORE (Top Right) */}
            {score > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    color: '#fbbf24',
                    fontSize: '24px',
                    fontWeight: '900',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {score}
                </div>
            )}
        </div>
    )
}

export default HUD
