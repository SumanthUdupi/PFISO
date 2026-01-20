import React, { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../../store'
import { useSettingsStore } from '../../stores/settingsStore'

export const Hitmarker: React.FC = () => {
    const [hits, setHits] = useState<{ id: number, x: number, y: number }[]>([])
    const idCounter = useRef(0)

    useEffect(() => {
        // Listen to event bus or store for damage events
        // Since we don't have a direct event bus hook here easily without importing,
        // let's assume we can subscribe to a transient store value or event.
        // For now, let's use a custom event on window or a store subscription if available.
        // Or better, import EventBus.

        const handleDamage = (e: CustomEvent) => {
            const id = idCounter.current++
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 20
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * 20

            setHits(prev => [...prev, { id, x, y }])

            setTimeout(() => {
                setHits(prev => prev.filter(h => h.id !== id))
            }, 500)
        }

        window.addEventListener('DAMAGE_DEALT', handleDamage as EventListener)
        return () => window.removeEventListener('DAMAGE_DEALT', handleDamage as EventListener)
    }, [])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {hits.map(hit => (
                <div
                    key={hit.id}
                    className="absolute w-8 h-8 pointer-events-none"
                    style={{
                        left: hit.x,
                        top: hit.y,
                        transform: 'translate(-50%, -50%) rotate(45deg)'
                    }}
                >
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white shadow-sm" />
                    <div className="absolute left-1/2 top-0 h-full w-[2px] bg-white shadow-sm" />
                </div>
            ))}
        </div>
    )
}
