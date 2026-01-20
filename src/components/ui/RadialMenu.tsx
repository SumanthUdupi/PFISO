import React, { useEffect, useState } from 'react'
import { useGameStore } from '../../store'
import { useUIStore } from '../../stores/uiStore'

// Mock items for the radial menu
const RADIAL_ITEMS = [
    { id: '1', label: 'Rifle', icon: '🔫' },
    { id: '2', label: 'Pistol', icon: '🔫' },
    { id: '3', label: 'Knife', icon: '🔪' },
    { id: '4', label: 'Medkit', icon: '❤️' },
    { id: '5', label: 'Grenade', icon: '💣' },
    { id: '6', label: 'Camera', icon: '📷' },
    { id: '7', label: 'Map', icon: '🗺️' },
    { id: '8', label: 'Flashlight', icon: '🔦' },
]

export const RadialMenu: React.FC = () => {
    const { isRadialMenuOpen, toggleRadialMenu } = useGameStore()
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        if (!isRadialMenuOpen) return

        const handleMouseMove = (e: MouseEvent) => {
            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2
            const dx = e.clientX - centerX
            const dy = e.clientY - centerY

            // Calculate angle in degrees (0 at top, clockwise)
            let angle = Math.atan2(dy, dx) * (180 / Math.PI)
            angle = angle + 90 // Rotate so 0 is at top
            if (angle < 0) angle += 360

            // Distance check to avoid selecting when in deadzone center
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < 50) {
                setActiveIndex(null)
                return
            }

            // Calculate index
            const sectorSize = 360 / RADIAL_ITEMS.length
            const index = Math.floor(angle / sectorSize) % RADIAL_ITEMS.length
            setActiveIndex(index)
            setMousePos({ x: e.clientX, y: e.clientY })
        }

        const handleMouseUp = () => {
            if (activeIndex !== null) {
                console.log("Selected:", RADIAL_ITEMS[activeIndex])
                // Trigger action here
            }
            toggleRadialMenu()
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isRadialMenuOpen, activeIndex, toggleRadialMenu])

    if (!isRadialMenuOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-96 h-96">
                {/* Center Deadzone / Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black/80 rounded-full border-2 border-white/20 flex items-center justify-center z-10 transition-all">
                    {activeIndex !== null ? (
                        <div className="text-center">
                            <div className="text-2xl">{RADIAL_ITEMS[activeIndex].icon}</div>
                            <div className="text-[10px] items-center font-bold text-white uppercase tracking-wider">{RADIAL_ITEMS[activeIndex].label}</div>
                        </div>
                    ) : (
                        <span className="text-white/50 text-xs">SELECT</span>
                    )}
                </div>

                {/* Segments */}
                {RADIAL_ITEMS.map((item, index) => {
                    const total = RADIAL_ITEMS.length
                    const rotation = (index * (360 / total)) - 90 // -90 to start at top
                    // Calculate position for icon
                    const angleRad = (index * (360 / total) - 90) * (Math.PI / 180)
                    const radius = 120
                    const x = Math.cos(angleRad) * radius
                    const y = Math.sin(angleRad) * radius

                    const isActive = index === activeIndex

                    return (
                        <React.Fragment key={item.id}>
                            {/* Slice Background - Using SVG for proper sector shapes would be better, but rotating blocks works for simple start */}
                            <div
                                className={`absolute top-1/2 left-1/2 w-1 h-[180px] origin-bottom transition-all duration-200 ${isActive ? 'bg-white/20 scale-110' : 'bg-transparent'}`}
                                style={{ transform: `translateX(-50%) translateY(-100%) rotate(${rotation}deg)` }}
                            >
                                {/* This is a thin line, we might want a proper SVG wedge. 
                                    For now, let's just place the icons and highlight. 
                                */}
                            </div>

                            {/* Icon Container */}
                            <div
                                className={`absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white text-black border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'bg-black/60 text-white border-white/30 backdrop-blur-md'}`}
                                style={{
                                    transform: `translate(${x}px, ${y}px)`
                                }}
                            >
                                <span className="text-2xl">{item.icon}</span>
                            </div>

                        </React.Fragment>
                    )
                })}
            </div>
            <div className="absolute bottom-10 text-white/70 text-sm font-medium tracking-widest uppercase">
                Release to Select
            </div>
        </div>
    )
}
