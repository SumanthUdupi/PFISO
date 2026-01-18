import React from 'react'
import useGameStore from '../../store'

const Reticle: React.FC = () => {
    const cursorType = useGameStore((state) => state.cursorType)

    // Tailwind styles for centering and transitions
    const containerStyle = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 z-50 flex items-center justify-center"

    // Render based on type
    const renderIcon = () => {
        switch (cursorType) {
            case 'GRAB':
                return (
                    <div className="text-white drop-shadow-md">
                        {/* Hand Icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L12 12" />
                            <path d="M12 12L16 16" />
                            <path d="M12 12L8 16" />
                            <circle cx="12" cy="12" r="10" className="opacity-50" />
                        </svg>
                    </div>
                )
            case 'SIT':
                return (
                    <div className="text-white drop-shadow-md">
                        {/* Chair/Sit Icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 13V5H17V13" />
                            <path d="M7 13H17L19 21H5L7 13Z" />
                        </svg>
                    </div>
                )
            case 'TALK':
                return (
                    <div className="text-white drop-shadow-md">
                        {/* Speech Bubble */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5C21 16.19 16.97 20 12 20C9.61 20 7.43 19.12 5.86 17.66L3 19L4.09 15.69C3.4 14.44 3 13.01 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z" />
                        </svg>
                    </div>
                )
            case 'HOVER':
                return (
                    <div className="w-6 h-6 border-2 border-white rounded-full opacity-80 drop-shadow-md transition-all scale-110" />
                )
            case 'DEFAULT':
            default:
                return (
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60 drop-shadow-sm" />
                )
        }
    }

    return (
        <div className={containerStyle}>
            {renderIcon()}
        </div>
    )
}

export default Reticle
