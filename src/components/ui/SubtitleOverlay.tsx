import React, { useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'

export const SubtitleOverlay: React.FC = () => {
    const { subtitle, subtitleDuration, showSubtitle } = useUIStore()

    useEffect(() => {
        if (subtitle) {
            const timer = setTimeout(() => {
                showSubtitle('') // Clear
            }, subtitleDuration)
            return () => clearTimeout(timer)
        }
    }, [subtitle, subtitleDuration, showSubtitle])

    if (!subtitle) return null

    return (
        <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '80%',
            textAlign: 'center',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            fontSize: '1.5rem',
            fontFamily: 'Inter, sans-serif',
            pointerEvents: 'none',
            zIndex: 1500,
            background: 'rgba(0,0,0,0.5)',
            padding: '10px 20px',
            borderRadius: '8px',
            backdropFilter: 'blur(2px)'
        }}>
            {subtitle}
        </div>
    )
}
