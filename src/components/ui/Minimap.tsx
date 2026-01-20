import React from 'react'
import { useThree } from '@react-three/fiber' // Can't use THREE hook outside Canvas, need store position
import { useGameStore } from '../../store'

// Mock map data - just a static image or generated dots
export const Minimap: React.FC = () => {
    // We need player position from store ideally, updating every frame is expensive for React
    // But for a simple HUD map, we can standard subscribe or use a ref updated by a component inside canvas?
    // Let's assume store has basic position, or we'll mock it for now as "Center"

    // For a real minimap, we usually have a 2nd camera or a top-down projection.
    // Here we'll just simulate a radar style UI.

    return (
        <div className="absolute bottom-8 right-8 w-48 h-48 rounded-full border-4 border-white/20 bg-black/60 backdrop-blur-md overflow-hidden z-[50]">
            {/* Compass Directions */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute top-2 text-white/50 text-xs font-bold">N</div>
                <div className="absolute bottom-2 text-white/50 text-xs font-bold">S</div>
                <div className="absolute left-2 text-white/50 text-xs font-bold">W</div>
                <div className="absolute right-2 text-white/50 text-xs font-bold">E</div>
            </div>

            {/* Player Icon (Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-cozy-accent z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

            {/* Radar Sweep Animation */}
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-t from-transparent via-cozy-accent/20 to-transparent origin-bottom-left animate-spin-slow rounded-full opacity-50"
                style={{ transformOrigin: '0% 0%' }} />

            {/* Mock POIs */}
            <div className="absolute top-10 left-20 w-2 h-2 bg-yellow-400 rounded-full" />
            <div className="absolute bottom-12 right-10 w-2 h-2 bg-red-500 rounded-full" />
        </div>
    )
}
