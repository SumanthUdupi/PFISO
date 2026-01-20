import React, { useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { shallow } from 'zustand/shallow'

export const SubtitleOverlay: React.FC = React.memo(() => {
    // PERF-012: Granular selectors to prevent unnecessary re-renders
    const subtitle = useUIStore(state => state.subtitle)
    const subtitleDuration = useUIStore(state => state.subtitleDuration)
    const showSubtitle = useUIStore(state => state.showSubtitle)

    const subtitleSize = useSettingsStore(state => state.subtitleSize)
    const subtitleBackgroundOpacity = useSettingsStore(state => state.subtitleBackgroundOpacity)

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
            fontSize: `${1.5 * subtitleSize}rem`,
            fontFamily: 'Inter, sans-serif',
            pointerEvents: 'none',
            zIndex: 1500,
            background: `rgba(0,0,0,${subtitleBackgroundOpacity})`,
            padding: '10px 20px',
            borderRadius: '8px',
            backdropFilter: 'blur(2px)',
            transition: 'font-size 0.2s ease-out'
        }}>
            {subtitle}
        </div>
    )
})
