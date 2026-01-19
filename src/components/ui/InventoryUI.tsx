import React, { useEffect } from 'react'
import useGameStore from '../../store'

const InventoryUI: React.FC = () => {
    const { items, isInventoryOpen, setPaused, sortInventory, maxInventorySize } = useGameStore()

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
            zIndex: 400,
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px', // Match grid width approx
                marginBottom: '20px',
                padding: '0 20px'
            }}>
                <h2 style={{
                    fontSize: '32px',
                    borderBottom: '2px solid #4ade80',
                    paddingBottom: '10px',
                    margin: 0
                }}>
                    INVENTORY
                </h2>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', color: items.length >= maxInventorySize ? '#ef4444' : '#aaa' }}>
                        {items.length} / {maxInventorySize}
                    </div>
                    <button
                        onClick={sortInventory}
                        style={{
                            padding: '8px 16px',
                            background: '#4ade80',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Sort
                    </button>
                </div>
            </div>

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

                {/* Fill empty slots visually up to a minimum grid, or up to maxInventorySize if we want to show capacity */}
                {Array.from({ length: Math.max(0, maxInventorySize - items.length) }).map((_, i) => (
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
