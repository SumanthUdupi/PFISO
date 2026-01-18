import React, { useEffect } from 'react'
import useGameStore from '../../store'

const Hotbar: React.FC = () => {
    const { activeSlot, slots, setActiveSlot } = useGameStore()

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1
                setActiveSlot(index)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setActiveSlot])

    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(0, 0, 0, 0.2)', // Glassmorphism backdrop
            padding: '10px',
            borderRadius: '16px',
            backdropFilter: 'blur(5px)',
            pointerEvents: 'auto', // Ensure clicks work
            zIndex: 100 // Above other UI?
        }}>
            {slots.map((item, index) => (
                <div
                    key={index}
                    onClick={() => setActiveSlot(index)}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: activeSlot === index
                            ? 'rgba(255, 235, 59, 0.4)' // Active Yellow
                            : 'rgba(255, 255, 255, 0.1)', // Inactive Glass
                        border: activeSlot === index
                            ? '2px solid #FFEB3B'
                            : '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: 'white',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif',
                        position: 'relative'
                    }}
                >
                    {/* Number Indicator */}
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: '4px',
                        fontSize: '10px',
                        opacity: 0.7
                    }}>{index + 1}</span>

                    {/* Item Content (Icon/Text) */}
                    {item === 'hands' && '✋'}
                    {item === 'camera' && '📷'}
                    {item === 'weapon' && '⚔️'}
                    {!['hands', 'camera', 'weapon'].includes(item) && item}
                </div>
            ))}
        </div>
    )
}

export default Hotbar
