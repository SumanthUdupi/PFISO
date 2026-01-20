import React, { useEffect, useState } from 'react'
import { useGameStore } from '../../store' // Fix default export if needed, or named
import inputs from '../../systems/InputManager'
import { usePhotoStore } from '../../stores/photoStore'

const PHOTO_FILTERS = [
    { name: 'None', filter: 'none' },
    { name: 'Cozy', filter: 'sepia(0.3) saturate(1.2) contrast(1.1)' },
    { name: 'B&W', filter: 'grayscale(100%) contrast(1.2)' },
    { name: 'Retro', filter: 'sepia(0.6) hue-rotate(-30deg) contrast(0.9)' },
    { name: 'Vibrant', filter: 'saturate(200%) contrast(1.1)' },
]

export default function PhotoOverlay() {
    const { togglePhotoMode, isPhotoMode } = useGameStore()
    const { addPhoto } = usePhotoStore()
    const [currentFilterIndex, setCurrentFilterIndex] = useState(0)
    const [flashOpacity, setFlashOpacity] = useState(0)

    useEffect(() => {
        if (!isPhotoMode) return

        const handleInput = () => {
            // ... existing inputs ...
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'p' || e.key === 'Escape') {
                togglePhotoMode()
            }
            if (e.key === 'Tab') {
                e.preventDefault()
                setCurrentFilterIndex((prev) => (prev + 1) % PHOTO_FILTERS.length)
            }
            if (e.key === 'Enter') {
                setFlashOpacity(1)

                // Screenshot Capture
                // Wait for flash frame? Or instant.
                // We need access to the canvas. 
                const canvas = document.querySelector('canvas')
                if (canvas) {
                    // Warning: toDataURL is sync and slow for large canvas
                    const data = canvas.toDataURL('image/jpeg', 0.8)
                    addPhoto(data, PHOTO_FILTERS[currentFilterIndex].name)
                }
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)

    }, [isPhotoMode, togglePhotoMode, currentFilterIndex, addPhoto])

    // Flash Fade
    useEffect(() => {
        if (flashOpacity > 0) {
            const timer = setTimeout(() => setFlashOpacity(Math.max(0, flashOpacity - 0.1)), 50)
            return () => clearTimeout(timer)
        }
    }, [flashOpacity])

    // Apply Filter to Canvas (We need to inject this into the global CSS or pass it up)
    // For now, let's just show the name.
    // To apply to canvas, we might need a useEffect that sets document.body style or similar.
    useEffect(() => {
        const canvas = document.querySelector('canvas')
        if (canvas) {
            canvas.style.filter = isPhotoMode ? PHOTO_FILTERS[currentFilterIndex].filter : 'none'
        }
        return () => {
            if (canvas) canvas.style.filter = 'none'
        }
    }, [isPhotoMode, currentFilterIndex])


    if (!isPhotoMode) return null

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: 50,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            {/* Flash */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'white', opacity: flashOpacity, transition: 'opacity 0.1s'
            }} />

            {/* Letterbox Bars */}
            <div style={{ width: '100%', height: '10%', backgroundColor: 'black' }} />

            <div style={{ flex: 1, position: 'relative', border: '2px solid rgba(255,255,255,0.3)', margin: '20px' }}>
                {/* Viewfinder Corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTop: '4px solid white', borderLeft: '4px solid white' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTop: '4px solid white', borderRight: '4px solid white' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottom: '4px solid white', borderLeft: '4px solid white' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottom: '4px solid white', borderRight: '4px solid white' }} />

                {/* Center Dot */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.5)', transform: 'translate(-50%, -50%)', borderRadius: '50%' }} />

                {/* Controls Hint */}
                <div style={{ position: 'absolute', bottom: 20, right: 20, color: 'white', fontFamily: 'monospace', textShadow: '0 1px 2px black', textAlign: 'right' }}>
                    <p style={{ margin: 0 }}>[ENTER] Snap</p>
                    <p style={{ margin: 0 }}>[TAB] Filter: {PHOTO_FILTERS[currentFilterIndex].name}</p>
                    <p style={{ margin: 0 }}>[P] Exit</p>
                </div>
            </div>

            <div style={{ width: '100%', height: '10%', backgroundColor: 'black' }} />
        </div>
    )
}
