import React, { useEffect } from 'react'
import useGameStore from '../../store'

const InventoryUI: React.FC = () => {
    const { items, isInventoryOpen, setPaused, sortInventory, maxInventorySize } = useGameStore()
    const [selectedItem, setSelectedItem] = React.useState<string | null>(null)
    const [tooltipItem, setTooltipItem] = React.useState<string | null>(null)
    const hoverTimeoutRef = React.useRef<number | null>(null)

    // Clear selection/tooltips when inventory closes
    useEffect(() => {
        if (!isInventoryOpen) {
            setSelectedItem(null)
            setTooltipItem(null)
            if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current)
        }
    }, [isInventoryOpen])

    // UX-032: Tooltip Delay
    const handleMouseEnter = (item: string) => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current)
        hoverTimeoutRef.current = window.setTimeout(() => {
            setTooltipItem(item)
        }, 500) // 500ms delay
    }

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current)
        setTooltipItem(null)
    }

    // UX-035: Mock Item Data Helper
    const getItemDetails = (name: string) => {
        const lower = name.toLowerCase()
        if (lower.includes('key')) return { type: 'Key Item', weight: 0.1, value: 0, desc: 'Used to unlock specific doors.' }
        if (lower.includes('doc')) return { type: 'Document', weight: 0.0, value: 0, desc: 'Contains information or lore.' }
        return { type: 'Misc', weight: 1.0, value: 10, desc: 'A generic item.' }
    }

    const getSortedItems = () => {
        if (sortMethod === 'NONE') return items

        return [...items].sort((a, b) => {
            if (sortMethod === 'NAME') return a.localeCompare(b)
            if (sortMethod === 'TYPE') {
                const getType = (name: string) => {
                    const n = name.toLowerCase()
                    if (n.includes('key')) return 'A_KEY'
                    if (n.includes('doc') || n.includes('paper') || n.includes('note')) return 'B_DOC'
                    return 'Z_MISC'
                }
                return getType(a).localeCompare(getType(b))
            }
            return 0
        })
    }

    // Auto-pause when opening inventory
    useEffect(() => {
        if (isInventoryOpen) {
            setPaused(true)
        } else {
            setPaused(false)
        }
    }, [isInventoryOpen, setPaused])

    if (!isInventoryOpen) return null

    const getItemIcon = (name: string) => {
        const lower = name.toLowerCase();
        // UX-005: High resolution SVG icons
        if (lower.includes('key')) {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                </svg>
            );
        }
        if (lower.includes('doc') || lower.includes('paper') || lower.includes('note')) {
            return (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            );
        }
        // Default box
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
        );
    };

    const displayedItems = getSortedItems()

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 400, color: 'white', fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ display: 'flex', width: '90%', maxWidth: '1000px', height: '80%', gap: '20px' }}>

                {/* Left Panel: Grid */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #4ade80', paddingBottom: '10px' }}>
                        <h2 style={{ fontSize: '32px', margin: 0 }}>INVENTORY</h2>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ fontSize: '18px', color: items.length >= maxInventorySize ? '#ef4444' : '#aaa', marginRight: '10px' }}>
                                {items.length} / {maxInventorySize}
                            </div>
                            <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Sort By:</span>
                            <button onClick={() => setSortMethod(c => c === 'NAME' ? 'NONE' : 'NAME')} style={{ padding: '6px 12px', background: sortMethod === 'NAME' ? '#4ade80' : 'rgba(255,255,255,0.1)', color: sortMethod === 'NAME' ? '#000' : '#fff', border: '1px solid #4ade80', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Name</button>
                            <button onClick={() => setSortMethod(c => c === 'TYPE' ? 'NONE' : 'TYPE')} style={{ padding: '6px 12px', background: sortMethod === 'TYPE' ? '#4ade80' : 'rgba(255,255,255,0.1)', color: sortMethod === 'TYPE' ? '#000' : '#fff', border: '1px solid #4ade80', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Type</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', overflowY: 'auto', paddingRight: '10px' }}>
                        {displayedItems.map((item, index) => (
                            <div
                                key={`${item}-${index}`}
                                onClick={() => setSelectedItem(item)}
                                onMouseEnter={() => handleMouseEnter(item)}
                                onMouseLeave={handleMouseLeave}
                                style={{
                                    height: '80px',
                                    background: selectedItem === item ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                                    border: selectedItem === item ? '2px solid #fff' : '2px solid #4ade80',
                                    borderRadius: '8px',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.1s',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ marginBottom: '5px' }}>{getItemIcon(item)}</div>
                                <div style={{ fontSize: '10px', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{item}</div>

                                {/* UX-032: Tooltip */}
                                {tooltipItem === item && (
                                    <div style={{
                                        position: 'absolute', bottom: '100%', left: '50%', transform: 'translate(-50%, -10px)',
                                        background: '#333', color: '#fff', padding: '4px 8px', borderRadius: '4px',
                                        fontSize: '12px', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 500,
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '1px solid #555'
                                    }}>
                                        {item}
                                    </div>
                                )}
                            </div>
                        ))}
                        {Array.from({ length: Math.max(0, maxInventorySize - items.length) }).map((_, i) => (
                            <div key={`empty-${i}`} style={{ width: '100%', height: '80px', background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed rgba(255, 255, 255, 0.2)', borderRadius: '8px' }} />
                        ))}
                    </div>
                </div>

                {/* Right Panel: Item Details (UX-035) */}
                <div style={{ flex: 1, background: 'rgba(20, 20, 20, 0.95)', border: '1px solid #444', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: 0 }}>ITEM DETAILS</h3>
                    {selectedItem ? (
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                <div style={{ transform: 'scale(1.5)' }}>{getItemIcon(selectedItem)}</div>
                            </div>
                            <h4 style={{ fontSize: '24px', margin: '0 0 10px 0', color: '#4ade80' }}>{selectedItem}</h4>
                            <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px', fontStyle: 'italic' }}>
                                {getItemDetails(selectedItem).desc}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                                <div style={{ color: '#888' }}>TYPE</div>
                                <div style={{ textAlign: 'right' }}>{getItemDetails(selectedItem).type}</div>

                                <div style={{ color: '#888' }}>WEIGHT</div>
                                <div style={{ textAlign: 'right' }}>{getItemDetails(selectedItem).weight}kg</div>

                                <div style={{ color: '#888' }}>VALUE</div>
                                <div style={{ textAlign: 'right' }}>{getItemDetails(selectedItem).value}¢</div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px' }}>
                                <button style={{ flex: 1, padding: '10px', background: '#4ade80', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>USE</button>
                                <button style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>DROP</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontStyle: 'italic' }}>
                            Select an item to view details
                        </div>
                    )}
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '40px', color: '#aaa', fontSize: '14px' }}>
                Press 'I' or 'ESC' to Close
            </div>
        </div>
    ) // End return
}

export default InventoryUI
