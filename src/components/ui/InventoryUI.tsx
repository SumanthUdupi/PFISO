import React, { useEffect } from 'react'
import useInventoryStore from '../../stores/inventoryStore'
import useGameStore from '../../stores/gameStore'

const InventoryUI: React.FC = () => {
    const { items } = useInventoryStore()
    const { isInventoryOpen, setPaused } = useGameStore()

    // Auto-pause when opening inventory
    useEffect(() => {
        if (isInventoryOpen) {
            setPaused(true)
        } else {
            setPaused(false)
        }
    }, [isInventoryOpen, setPaused])

    if (!isInventoryOpen) return null

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h2 style={{
                fontSize: '32px',
                marginBottom: '40px',
                borderBottom: '2px solid #4ade80',
                paddingBottom: '10px'
            }}>
                INVENTORY
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {/* Render items */}
                {items.map((item, index) => (
                    <div key={index} style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '2px solid #4ade80',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔑</div>
                        <div style={{ fontSize: '10px', textAlign: 'center' }}>{item}</div>
                    </div>
                ))}

                {/* Fill empty slots to make a grid of 8 */}
                {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
                    <div key={`empty-${i}`} style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px'
                    }} />
                ))}
            </div>

            <div style={{ marginTop: '40px', color: '#aaa', fontSize: '14px' }}>
                Press 'I' or 'ESC' to Close
            </div>
        </div>
    )
}

export default InventoryUI
